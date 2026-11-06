import json
import os
from pathlib import Path

import pytest
from app.schemas.usage import UsageReport
from app.services.usage_dashboard import render_usage
from test_usage_dashboard import add, get, seed

KEYS = ["detail_disclosure", "budget_completion", "trip_update"]


def engagement_seed(db):
    """Synthetic: repeated actions and orphan completions/updates, never real KPIs."""
    for name in ["PAGE_VIEW", "DEAL_VIEW", "BUDGET_USE", "TRIP_SAVE"]:
        add(db, name, "private-one")
    for name in ["DEAL_DETAILS_OPEN", "BUDGET_CALCULATED", "TRIP_UPDATE"]:
        for _ in range(2):
            add(db, name, "private-one", metadata={"page_type": "budget", "token": "private-token"})
    add(db, "BUDGET_CALCULATED", "private-restored")  # no BUDGET_USE
    add(db, "TRIP_UPDATE", "private-updated")  # no TRIP_SAVE
    add(db, "PAGE_VIEW", "private-other")
    db.commit()


def test_received_session_population_bounds_rates_without_inventing_a_funnel(api_client, isolated_db):
    engagement_seed(isolated_db)
    body = get(api_client).json()
    assert body["observed_events"] == 13 and body["observed_sessions"] == 4
    report = body["engagement"]
    assert report["version"] == "received-session-engagement-v1"
    assert report["metrics"] == [
        {"key": key, "status": "available", "numerator": count,
         "denominator": 4, "percent": rate}
        for key, count, rate in [(KEYS[0], 1, "25.00"), (KEYS[1], 2, "50.00"), (KEYS[2], 2, "50.00")]
    ]
    old = {row["key"]: row for row in body["metrics"]}
    assert old["budget_usage"]["numerator"] == old["trip_save"]["numerator"] == 1
    assert "private" not in json.dumps(body)
    assert len(body["metrics"]) == 11
    assert body["ordered_funnel"]["version"] == "ordered-session-funnel-v1"


def test_old_metrics_and_funnel_remain_unchanged_when_new_events_were_not_received(api_client, isolated_db):
    seed(isolated_db)
    body = get(api_client).json()
    assert len(body["metrics"]) == 11
    assert next(row for row in body["metrics"] if row["key"] == "detail_opening")["percent"] == "50.00"
    assert [row["sessions"] for row in body["ordered_funnel"]["steps"]] == [3, 2, 1, 1, 1]
    assert all(row["status"] == "available" and row["numerator"] == 0
               and row["denominator"] == 4 and row["percent"] == "0.00"
               for row in body["engagement"]["metrics"])


@pytest.mark.parametrize("has_sessions", [False, True])
def test_no_data_is_separate_from_zero_received_actions(api_client, isolated_db, has_sessions):
    if has_sessions:
        add(isolated_db, "PAGE_VIEW", "private-other")
        isolated_db.commit()
    rows = get(api_client).json()["engagement"]["metrics"]
    assert [row["key"] for row in rows] == KEYS
    assert all(row["numerator"] == 0 and row["denominator"] == int(has_sessions) for row in rows)
    assert all(row["status"] == ("available" if has_sessions else "no_data")
               and row["percent"] == ("0.00" if has_sessions else None) for row in rows)


def test_engagement_uses_the_existing_window_and_placeholder_exclusions(api_client, isolated_db):
    for session in ["", "anonymous", "not-provided"]:
        add(isolated_db, "BUDGET_CALCULATED", session)
    add(isolated_db, "UNKNOWN", "private-unknown")
    add(isolated_db, "BUDGET_CALCULATED", "private-before", -1)
    add(isolated_db, "TRIP_UPDATE", "private-at-end", 86400)
    add(isolated_db, "DEAL_DETAILS_OPEN", "private-at-start", 0)
    isolated_db.commit()
    body = get(api_client).json()
    assert body["excluded_events"] == 4
    assert body["observed_events"] == body["observed_sessions"] == 1
    assert [row["percent"] for row in body["engagement"]["metrics"]] == ["100.00", "0.00", "0.00"]


def test_legacy_usage_report_constructor_and_rendering_remain_supported(api_client, isolated_db):
    seed(isolated_db)
    body = get(api_client).json()
    body.pop("engagement")
    legacy = UsageReport.model_validate(body)
    assert legacy.engagement is None
    html = render_usage(legacy)
    assert "data-engagement=" not in html and html.count("data-metric=") == 11


@pytest.mark.parametrize("locale", ["pl", "en", "ru", "uk"])
@pytest.mark.parametrize("state", ["populated", "zero", "empty"])
def test_engagement_dashboard_is_localized_private_and_script_free(api_client, isolated_db, locale, state):
    if state == "populated":
        engagement_seed(isolated_db)
    elif state == "zero":
        seed(isolated_db)
    response = get(api_client, "dashboard", locale=locale)
    assert 'data-engagement="received-session-engagement-v1"' in response.text
    assert all(f'data-metric="{key}"' in response.text for key in KEYS)
    assert f'<html lang="{locale}">' in response.text
    assert "private" not in response.text and "<script" not in response.text
    assert "noindex" in response.headers["x-robots-tag"]
    if state == "empty":
        assert "0.00%" not in response.text
    if directory := os.getenv("HOPTRIP_18B5_EVIDENCE"):
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / f"dashboard-{locale}-{state}.html").write_text(response.text, encoding="utf-8")
        if locale == "pl":
            (target / f"usage-{state}.json").write_text(json.dumps(get(api_client).json(), indent=2), encoding="utf-8")
