import json
import os
from pathlib import Path

import pytest
from app.models.analytics import AnalyticsEvent
from app.services.usage_metrics import ordered_funnel
from test_usage_dashboard import HEADERS, PARAMS, add, get, seed


def rows(items):
    return [AnalyticsEvent(event_name=name, anonymous_session_id="synthetic-session",
                           deal_id=deal, metadata_json=metadata)
            for name, deal, metadata in items]


PREFIX = [("PAGE_VIEW", None, {}), ("SEARCH", None, {}),
          ("SEARCH_RESULT", None, {"search": {"result_count": 3}})]


def counts(events):
    return [step.sessions for step in ordered_funnel(rows(events)).steps]


def test_ordered_funnel_is_additive_and_uses_pageview_population(api_client, isolated_db):
    seed(isolated_db)
    body = get(api_client).json()
    funnel = body["ordered_funnel"]
    assert funnel["version"] == "ordered-session-funnel-v1"
    assert [step["sessions"] for step in funnel["steps"]] == [3, 2, 1, 1, 1]
    assert [step["percent"] for step in funnel["steps"]] == [None, "66.67", "50.00", "100.00", "100.00"]
    assert [step["previous_sessions"] for step in funnel["steps"]] == [None, 3, 2, 1, 1]
    assert body["observed_sessions"] == 4  # orphan click is outside the ordered funnel
    assert "synthetic" not in json.dumps(body)
    assert next(row for row in body["metrics"] if row["key"] == "search_initiation")["percent"] == "50.00"


def test_same_deal_order_and_duplicates_are_required_without_first_deal_bias():
    events = PREFIX + [("PARTNER_CLICK", 1, {}), ("DEAL_VIEW", 1, {}),
                       ("PARTNER_CLICK", 2, {})]
    assert counts(events) == [1, 1, 1, 1, 0]
    events += [("DEAL_VIEW", 2, {}), ("PARTNER_CLICK", 2, {}), ("PARTNER_CLICK", 2, {})]
    assert counts(events) == [1, 1, 1, 1, 1]
    assert counts(events + events) == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("result", [None, {}, {"result_count": 0}, {"result_count": True},
                                    {"result_count": -1}, {"result_count": 101},
                                    {"result_count": 2, "error": "unavailable"},
                                    {"error": "unavailable"}])
def test_empty_error_and_malformed_results_do_not_advance(result):
    assert counts(PREFIX[:2] + [("SEARCH_RESULT", None, {"search": result}),
                               ("DEAL_VIEW", 1, {}), ("PARTNER_CLICK", 1, {})]) == [1, 1, 0, 0, 0]


def test_missing_or_wrong_order_steps_are_not_inferred():
    assert counts(PREFIX[1:] + [("DEAL_VIEW", 1, {}), ("PARTNER_CLICK", 1, {})]) == [0] * 5
    assert counts([PREFIX[1], PREFIX[0], PREFIX[2]]) == [1, 0, 0, 0, 0]
    assert counts(PREFIX + [("DEAL_VIEW", None, {}), ("PARTNER_CLICK", None, {})]) == [1, 1, 1, 0, 0]


def test_funnel_is_session_existence_proxy_not_search_attribution():
    assert counts(PREFIX + [("SEARCH", None, {}),
                           ("SEARCH_RESULT", None, {"search": {"result_count": 0}}),
                           ("DEAL_VIEW", 1, {}), ("PARTNER_CLICK", 1, {})]) == [1] * 5


def test_empty_and_zero_denominators_remain_null():
    result = ordered_funnel([])
    assert all(step.status == "no_data" and step.percent is None for step in result.steps)
    result = ordered_funnel(rows(PREFIX[:1]))
    assert result.steps[1].percent == 0 and result.steps[1].status == "available"
    assert result.steps[2].percent is None and result.steps[2].status == "no_data"


def test_window_and_same_timestamp_db_id_order_apply(api_client, isolated_db):
    deal = seed(isolated_db)
    for name in ["PAGE_VIEW", "SEARCH", "SEARCH_RESULT", "DEAL_VIEW", "PARTNER_CLICK"]:
        add(isolated_db, name, "synthetic-tie", 10, deal=deal,
            metadata={"search": {"result_count": 1}} if name == "SEARCH_RESULT" else {})
    add(isolated_db, "PARTNER_CLICK", "outside-window", 86400, deal=deal)
    isolated_db.commit()
    assert [step["sessions"] for step in get(api_client).json()["ordered_funnel"]["steps"]] == [4, 3, 2, 2, 2]


@pytest.mark.parametrize("locale", ["pl", "en", "ru", "uk"])
def test_dashboard_renders_localized_funnel_without_credentials_or_ids(api_client, isolated_db, locale):
    seed(isolated_db)
    response = api_client.get("/api/v1/admin/analytics/dashboard",
                              params={**PARAMS, "locale": locale}, headers=HEADERS)
    assert response.status_code == 200
    assert 'data-funnel="ordered-session-funnel-v1"' in response.text
    assert 'lang="' + locale + '"' in response.text
    assert "synthetic" not in response.text and HEADERS["X-Admin-Token"] not in response.text
    assert "<script" not in response.text and "noindex" in response.headers["x-robots-tag"]
    if directory := os.getenv("HOPTRIP_18B_EVIDENCE"):
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / f"dashboard-{locale}.html").write_text(response.text, encoding="utf-8")
