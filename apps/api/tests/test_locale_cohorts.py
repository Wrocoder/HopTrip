import json
import os
from pathlib import Path
from typing import get_args
from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from app.schemas.usage import UsageReport
from app.services.usage_dashboard import DashboardLocale, render_usage
from sqlalchemy import select
from test_usage_dashboard import add, get, seed


def locale_seed(db):
    """Synthetic page-language changes and legacy events, not real traffic."""
    add(db, "BUDGET_CALCULATED", "private-en", 0, metadata={"locale": "en"})
    add(db, "PAGE_VIEW", "private-en", 1, metadata={"locale": "ru"})
    add(db, "DEAL_DETAILS_OPEN", "private-en", 2, metadata={"locale": "ru"})
    add(db, "DEAL_DETAILS_OPEN", "private-en", 3, metadata={"locale": "uk"})
    add(db, "PAGE_VIEW", "private-pl", 1, metadata={"locale": "pl"})
    add(db, "TRIP_UPDATE", "private-pl", 2, metadata={"locale": "pl"})
    add(db, "PAGE_VIEW", "private-ru", 1, metadata={"locale": "ru"})
    add(db, "TRIP_UPDATE", "private-uk", 1, metadata={"locale": "uk"})
    add(db, "PAGE_VIEW", "private-legacy", 1)
    add(db, "TRIP_UPDATE", "private-legacy", 2, metadata={"locale": "pl"})
    db.commit()


def test_first_received_locale_partitions_sessions_and_preserves_legacy_metrics(api_client, isolated_db):
    locale_seed(isolated_db)
    body = get(api_client).json()
    assert body["observed_events"] == 10 and body["observed_sessions"] == 5
    assert body["locale_cohorts"]["version"] == "first-received-locale-cohorts-v1"
    rows = body["locale_cohorts"]["rows"]
    assert [r["locale"] for r in rows] == ["en", "pl", "ru", "uk", "unknown"]
    assert all(r["sessions"] == 1 and r["percent"] == "20.00" for r in rows)
    assert [[m["numerator"] for m in r["metrics"]] for r in rows] == [[1, 1, 0], [0, 0, 1], [0, 0, 0], [0, 0, 1], [0, 0, 1]]
    for row in rows:
        assert all(m["denominator"] == row["sessions"] for m in row["metrics"])
    for i, metric in enumerate(body["engagement"]["metrics"]):
        assert sum(r["metrics"][i]["numerator"] for r in rows) == metric["numerator"]
    assert sum(r["sessions"] for r in rows) == body["observed_sessions"]
    assert len(body["metrics"]) == 11 and body["ordered_funnel"]["version"] == "ordered-session-funnel-v1"
    assert {m["key"]: m["status"] for m in body["metrics"]}["returning_visitors"] == "unavailable"
    assert "private" not in json.dumps(body)


@pytest.mark.parametrize("metadata", [None, [], {"locale": None}, {"locale": []}, {"locale": {}},
    {"locale": True}, {"locale": 1}, {"locale": "EN"}, {"locale": "en-GB"}, {"locale": " en"},
    {"locale": "en "}, {"locale": "de"}, {"locale": "unknown"}, {"locale": "private@example.test"}])
def test_missing_or_invalid_first_locale_stays_unknown_without_backfill(api_client, isolated_db, metadata):
    row = add(isolated_db, "BUDGET_USE", "private-first")
    row.metadata_json = metadata
    add(isolated_db, "PAGE_VIEW", "private-first", 2, metadata={"locale": "en"})
    isolated_db.commit()
    rows = get(api_client).json()["locale_cohorts"]["rows"]
    assert [(r["locale"], r["sessions"]) for r in rows] == [("unknown", 1)]


def test_window_server_order_and_exclusions_choose_the_first_context(api_client, isolated_db):
    add(isolated_db, "PAGE_VIEW", "private-one", -1, metadata={"locale": "uk"})
    add(isolated_db, "BUDGET_USE", "private-one", 1, metadata={"locale": "en"})
    add(isolated_db, "PAGE_VIEW", "private-one", 1, metadata={"locale": "pl"})
    add(isolated_db, "PAGE_VIEW", "private-end", 86400, metadata={"locale": "ru"})
    add(isolated_db, "PAGE_VIEW", "anonymous", metadata={"locale": "ru"})
    add(isolated_db, "UNKNOWN", "private-excluded", metadata={"locale": "ru"})
    isolated_db.commit()
    body = get(api_client).json()
    assert body["observed_sessions"] == 1 and body["excluded_events"] == 2
    assert [(r["locale"], r["percent"]) for r in body["locale_cohorts"]["rows"]] == [("en", "100.00")]


@pytest.mark.parametrize("value", ["pl", "en", "ru", "uk", None, "EN", "en-GB", "unknown", [], {}, True, 1, "private-token"])
def test_public_post_only_retains_bounded_page_language(api_client, isolated_db, value):
    response = api_client.post("/api/v1/analytics/events", json={
        "event_id": str(uuid4()), "event_name": "PAGE_VIEW", "anonymous_session_id": "synthetic-locale",
        "metadata": {"locale": value, "page_type": "saved", "language": "private-token", "url": "/private"},
    }, headers={"Accept-Language": "de-DE"})
    assert response.status_code == 202
    row = isolated_db.scalar(select(AnalyticsEvent))
    expected = {"page_type": "saved"}
    if isinstance(value, str) and value in {"pl", "en", "ru", "uk"}:
        expected["locale"] = value
    assert row.metadata_json == expected


def test_empty_population_and_legacy_constructor(api_client):
    body = get(api_client).json()
    assert body["locale_cohorts"]["rows"] == []
    body.pop("locale_cohorts")
    legacy = UsageReport.model_validate(body)
    assert legacy.locale_cohorts is None
    assert "data-locale-cohorts=" not in render_usage(legacy)


def test_locale_contract_matches_existing_dashboard_languages():
    from app.schemas.analytics import AnalyticsLocale
    from app.schemas.usage import LocaleKey

    assert set(get_args(AnalyticsLocale)) == set(get_args(DashboardLocale)) == {"pl", "en", "ru", "uk"}
    assert set(get_args(LocaleKey)) == set(get_args(AnalyticsLocale)) | {"unknown"}


@pytest.mark.parametrize("locale", ["pl", "en", "ru", "uk"])
@pytest.mark.parametrize("state", ["populated", "unknown", "empty"])
def test_localized_dashboard_keeps_report_language_separate_from_event_locale(api_client, isolated_db, locale, state):
    if state == "populated":
        locale_seed(isolated_db)
    elif state == "unknown":
        seed(isolated_db)
    response = get(api_client, "dashboard", locale=locale)
    assert 'data-locale-cohorts="first-received-locale-cohorts-v1"' in response.text
    assert "private" not in response.text and "<script" not in response.text
    assert "noindex" in response.headers["x-robots-tag"]
    if directory := os.getenv("HOPTRIP_18B9_EVIDENCE"):
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / f"dashboard-{locale}-{state}.html").write_text(response.text, encoding="utf-8")
        if locale == "pl":
            (target / f"usage-{state}.json").write_text(json.dumps(get(api_client).json(), indent=2), encoding="utf-8")
