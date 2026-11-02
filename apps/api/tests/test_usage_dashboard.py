import json
import os
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
from app.models.analytics import AnalyticsEvent
from app.models.deal import Deal
from app.services import usage_metrics
from helpers import catalog_fixture
from sqlalchemy import event, select

HEADERS = {"X-Admin-Token": "change-me-in-development"}
START = datetime(2026, 10, 1, tzinfo=UTC)
END = START + timedelta(days=1)
PARAMS = {"start": START.isoformat(), "end": END.isoformat()}
PATH = "/api/v1/admin/analytics/"


def add(db, name, session, second=1, *, deal=None, metadata=None):
    row = AnalyticsEvent(event_name=name, anonymous_session_id=session,
                         created_at=START + timedelta(seconds=second),
                         deal_id=deal.id if deal else None, metadata_json=metadata or {})
    db.add(row)
    return row


def seed(db):
    """Explicit synthetic events, never production measurements."""
    deal, _ = catalog_fixture(db)
    add(db, "PAGE_VIEW", "synthetic-one", metadata={"page_type": "home"})
    add(db, "SEARCH", "synthetic-one", 2)
    add(db, "SEARCH_RESULT", "synthetic-one", 3, metadata={"search": {"result_count": 4}})
    add(db, "DEAL_VIEW", "synthetic-one", 4, deal=deal)
    add(db, "PARTNER_CLICK", "synthetic-one", 5, deal=deal)
    for name in ["TRIP_SAVE", "BUDGET_USE", "EVENT_CLICK"]:
        add(db, name, "synthetic-one", 6)
    add(db, "PARTNER_CLICK", "synthetic-two", 0, deal=deal)
    add(db, "PAGE_VIEW", "synthetic-two", metadata={"page_type": "catalog"})
    add(db, "SEARCH", "synthetic-two", 2)
    add(db, "SEARCH_RESULT", "synthetic-two", 3, metadata={"search": {"result_count": 0}})
    add(db, "DEAL_VIEW", "synthetic-two", 4, deal=deal)
    add(db, "ACTIVITY_CLICK", "synthetic-two", 5)
    add(db, "PAGE_VIEW", "synthetic-three", metadata={"page_type": "guide"})
    add(db, "SEARCH_RESULT", "synthetic-three", 3, metadata={"search": {"error": "unavailable"}})
    add(db, "PARTNER_CLICK", "synthetic-four", 2)
    db.commit()
    return deal


def get(api_client, suffix="usage", **params):
    response = api_client.get(PATH + suffix, params={**PARAMS, **params}, headers=HEADERS)
    assert response.status_code == 200, response.text
    return response


@pytest.mark.parametrize("suffix", ["usage", "dashboard"])
@pytest.mark.parametrize("headers", [{}, {"X-Admin-Token": "wrong"}])
def test_usage_and_dashboard_require_existing_admin_auth(api_client, suffix, headers):
    response = api_client.get(PATH + suffix, params=PARAMS, headers=headers)
    assert response.status_code == 401
    assert "observed_sessions" not in response.text


def test_metrics_use_stored_events_explicit_denominators_and_order(api_client, isolated_db):
    seed(isolated_db)
    body = get(api_client).json()
    assert body["observed_events"] == 17
    assert body["observed_sessions"] == 4
    metrics = {row["key"]: row for row in body["metrics"]}
    for key, numerator, denominator, percent in [
        ("search_initiation", 2, 4, "50.00"), ("search_success", 1, 3, "33.33"),
        ("empty_results", 1, 2, "50.00"), ("result_errors", 1, 3, "33.33"),
        ("detail_opening", 2, 4, "50.00"), ("affiliate_ctr", 1, 2, "50.00"),
        ("trip_save", 1, 4, "25.00"), ("budget_usage", 1, 4, "25.00"),
        ("event_engagement", 2, 4, "50.00"),
    ]:
        assert metrics[key] == {"key": key, "status": "available", "numerator": numerator,
                                "denominator": denominator, "percent": percent}
    for key in ["returning_visitors", "device_funnel"]:
        assert metrics[key]["status"] == "unavailable"
        assert metrics[key]["numerator"] is metrics[key]["denominator"] is metrics[key]["percent"] is None
    cohorts = {row["page_type"]: row for row in body["page_cohorts"]}
    assert cohorts["home"]["partner_sessions"] == 1
    assert cohorts["catalog"]["partner_sessions"] == 0  # earlier click is not an outcome
    assert cohorts["not_observed"]["sessions"] == 1
    assert cohorts["not_observed"]["percent"] is None
    assert "synthetic" not in json.dumps(body)


def test_empty_dataset_is_no_data_not_a_zero_baseline(api_client):
    body = get(api_client).json()
    assert body["observed_sessions"] == body["observed_events"] == 0
    assert body["page_cohorts"] == []
    assert all(row["percent"] is None for row in body["metrics"])
    assert all(row["status"] == "no_data" for row in body["metrics"][:9])
    html = get(api_client, "dashboard").text
    assert "0.00%" not in html
    if directory := os.getenv("HOPTRIP_USAGE_EVIDENCE_DIR"):
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / "fixture-empty.html").write_text(html, encoding="utf-8")


def test_window_is_inclusive_exclusive_and_normalized_to_utc(api_client, isolated_db):
    add(isolated_db, "PAGE_VIEW", "at-start", 0)
    add(isolated_db, "PAGE_VIEW", "before-start", -1)
    add(isolated_db, "PAGE_VIEW", "at-end", 86400)
    isolated_db.commit()
    body = get(api_client, start="2026-10-01T02:00:00+02:00", end="2026-10-02T02:00:00+02:00").json()
    assert body["observed_events"] == body["observed_sessions"] == 1
    assert body["start"] == "2026-10-01T00:00:00Z"


@pytest.mark.parametrize("params", [
    {"start": "2026-10-01T00:00:00"}, {"end": "2026-10-02T00:00:00"},
    {"end": START.isoformat()}, {"end": (START - timedelta(seconds=1)).isoformat()},
    {"end": (START + timedelta(days=32)).isoformat()}, {"start": "invalid"},
])
def test_invalid_or_unbounded_windows_fail_honestly(api_client, params):
    for suffix in ["usage", "dashboard"]:
        assert api_client.get(PATH + suffix, params={**PARAMS, **params}, headers=HEADERS).status_code == 422


def test_default_window_is_seven_days_and_unknown_locale_is_rejected(api_client):
    response = api_client.get(PATH + "usage", headers=HEADERS)
    assert response.status_code == 200
    body = response.json()
    assert datetime.fromisoformat(body["end"]) - datetime.fromisoformat(body["start"]) == timedelta(days=7)
    assert api_client.get(PATH + "dashboard", params={**PARAMS, "locale": "de"}, headers=HEADERS).status_code == 422


@pytest.mark.parametrize("params", [{"end": "0001-01-01T00:00:00Z"},
                                     {"start": "9999-12-31T23:59:00-12:00"}])
def test_calendar_overflow_is_validation_error_not_server_error(api_client, params):
    for suffix in ["usage", "dashboard"]:
        assert api_client.get(PATH + suffix, params=params, headers=HEADERS).status_code == 422


def test_excess_rows_are_rejected_without_partial_metrics(api_client, isolated_db, monkeypatch):
    add(isolated_db, "PAGE_VIEW", "synthetic-one")
    add(isolated_db, "PAGE_VIEW", "synthetic-two")
    isolated_db.commit()
    monkeypatch.setattr(usage_metrics, "MAX_USAGE_EVENTS", 1)
    for suffix in ["usage", "dashboard"]:
        response = api_client.get(PATH + suffix, params=PARAMS, headers=HEADERS)
        assert response.status_code == 413
        assert "shorter period" in response.text
        assert "observed_events" not in response.text


@pytest.mark.parametrize("outcome", [None, {}, {"result_count": True}, {"result_count": -1},
                                     {"result_count": 101}, {"error": "raw-private-error"},
                                     {"result_count": 0, "error": "unavailable"}])
def test_malformed_legacy_outcome_never_becomes_an_empty_result(api_client, isolated_db, outcome):
    add(isolated_db, "SEARCH_RESULT", "synthetic-one", metadata={"search": outcome})
    isolated_db.commit()
    body = get(api_client).json()
    assert body["invalid_results"] == 1
    assert next(row for row in body["metrics"] if row["key"] == "empty_results")["percent"] is None
    assert "raw-private-error" not in json.dumps(body)


def test_context_order_different_offer_and_repeats_do_not_inflate_conversion(api_client, isolated_db):
    deal, _ = catalog_fixture(isolated_db)
    other = Deal(slug="other-synthetic", origin_airport_id=deal.origin_airport_id,
                 destination_id=deal.destination_id, trip_start=deal.trip_start,
                 trip_end=deal.trip_end, nights=3, total_estimated_pln=1, price_per_person_pln=1,
                 deal_score=0, confidence=0, last_verified_at=START)
    isolated_db.add(other)
    isolated_db.flush()
    add(isolated_db, "PARTNER_CLICK", "synthetic-one", deal=deal)  # same timestamp, lower id
    add(isolated_db, "DEAL_VIEW", "synthetic-one", deal=deal)
    add(isolated_db, "PARTNER_CLICK", "synthetic-one", deal=other)
    isolated_db.commit()
    row = next(row for row in get(api_client).json()["metrics"] if row["key"] == "affiliate_ctr")
    assert row["numerator"] == 0 and row["denominator"] == 1
    for _ in range(3):
        add(isolated_db, "PARTNER_CLICK", "synthetic-one", deal=deal)
        add(isolated_db, "ACTIVITY_CLICK", "synthetic-one")
        add(isolated_db, "EVENT_CLICK", "synthetic-one")
    isolated_db.commit()
    rows = {row["key"]: row for row in get(api_client).json()["metrics"]}
    assert rows["affiliate_ctr"]["numerator"] == 1
    assert rows["affiliate_ctr"]["percent"] == rows["event_engagement"]["percent"] == "100.00"


def test_technical_events_and_placeholder_sessions_are_excluded(api_client, isolated_db):
    for name, session in [("AFFILIATE_CLICK", "not-provided"), ("PAGE_VIEW", "anonymous"),
                          ("PAGE_VIEW", ""), ("UNKNOWN", "synthetic-one")]:
        add(isolated_db, name, session)
    add(isolated_db, "DEAL_VIEW", "synthetic-two")
    isolated_db.commit()
    body = get(api_client).json()
    assert body["excluded_events"] == 4
    assert body["observed_events"] == body["observed_sessions"] == body["unlinked_detail_views"] == 1


def test_metadata_identifiers_and_tokens_never_appear_in_reports(api_client, isolated_db):
    add(isolated_db, "PAGE_VIEW", "private-session", metadata={"page_type": '<script>alert("private-token")</script>',
        "email": "private@example.test", "campaign": "private-token", "page": "/trip?plan=private-plan"})
    isolated_db.commit()
    for suffix in ["usage", "dashboard"]:
        response = get(api_client, suffix)
        for secret in ["private", "<script", "plan=", "X-Admin-Token", HEADERS["X-Admin-Token"]]:
            assert secret not in response.text
    assert get(api_client).json()["page_cohorts"][0]["page_type"] == "unclassified"


def test_reports_only_select_without_writes_or_commits(api_client, isolated_db):
    seed(isolated_db)
    verbs = []

    def record(conn, cursor, statement, parameters, context, executemany):
        verbs.append(statement.split()[0].upper())

    engine = isolated_db.get_bind()
    event.listen(engine, "before_cursor_execute", record)
    try:
        get(api_client)
        get(api_client, "dashboard")
    finally:
        event.remove(engine, "before_cursor_execute", record)
    assert verbs and set(verbs) == {"SELECT"}
    assert len(list(isolated_db.scalars(select(AnalyticsEvent)))) == 17


@pytest.mark.parametrize("locale", ["pl", "en", "ru", "uk"])
def test_localized_script_free_dashboard_and_evidence(api_client, isolated_db, locale):
    seed(isolated_db)
    response = get(api_client, "dashboard", locale=locale)
    assert f'<html lang="{locale}">' in response.text
    assert "default-src 'none'" in response.headers["content-security-policy"]
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]
    assert response.headers["x-robots-tag"] == "noindex, nofollow, nosnippet"
    assert "no-store" in response.headers["cache-control"]
    assert 'name="referrer" content="no-referrer"' in response.text
    assert "<script" not in response.text and 'href="http' not in response.text
    directory = os.getenv("HOPTRIP_USAGE_EVIDENCE_DIR")
    if directory:
        target = Path(directory)
        target.mkdir(parents=True, exist_ok=True)
        (target / f"fixture-{locale}.html").write_text(response.text, encoding="utf-8")
        (target / "fixture-usage.json").write_text(json.dumps(get(api_client).json(), ensure_ascii=False, indent=2), encoding="utf-8")
