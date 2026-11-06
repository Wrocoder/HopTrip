from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from helpers import catalog_fixture
from sqlalchemy import select
from test_usage_dashboard import HEADERS


def test_details_open_is_private_idempotent_and_distinct_from_detail_visit(api_client, isolated_db):
    deal, _ = catalog_fixture(isolated_db)
    payload = {
        "event_id": str(uuid4()), "event_name": "DEAL_DETAILS_OPEN",
        "anonymous_session_id": "synthetic-details-session", "deal_slug": deal.slug,
        "metadata": {"page_type": "catalog", "token": "private-token", "label": "private label"},
        "url": "/trip#plan=private-token", "plan_id": "private-plan",
    }
    for _ in range(2):
        response = api_client.post("/api/v1/analytics/events", json=payload)
        assert response.status_code == 202, response.text
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 1 and rows[0].event_name == "DEAL_DETAILS_OPEN"
    assert rows[0].metadata_json == {"page_type": "catalog"}
    assert rows[0].deal_id == deal.id and rows[0].component is None
    now = datetime.now(UTC)
    params = {"start": (now - timedelta(days=1)).isoformat(),
              "end": (now + timedelta(days=1)).isoformat()}
    summary = api_client.get("/api/v1/admin/analytics/summary", params=params, headers=HEADERS)
    assert summary.status_code == 200
    assert summary.json()["by_event"] == {"DEAL_DETAILS_OPEN": 1}
    usage = api_client.get("/api/v1/admin/analytics/usage", params=params, headers=HEADERS)
    assert usage.status_code == 200
    assert usage.json()["observed_events"] == 1 and usage.json()["excluded_events"] == 0
    assert all(step["sessions"] == 0 for step in usage.json()["ordered_funnel"]["steps"])
    assert next(m for m in usage.json()["metrics"] if m["key"] == "detail_opening")["numerator"] == 0


@pytest.mark.parametrize("context", [
    {"search": {"filters": {}}},
    {"partner": {"category": "flight", "provider": "catalog"}},
    {"filter": {"action": "apply"}},
    {"activity": {"city": "rome", "activity_id": "tiqets-1",
                  "page": "/info/rome", "link_kind": "affiliate"}},
])
def test_details_open_rejects_unrelated_contexts(api_client, isolated_db, context):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "DEAL_DETAILS_OPEN", "anonymous_session_id": "synthetic-session", **context,
    }).status_code == 422
    assert list(isolated_db.scalars(select(AnalyticsEvent))) == []


def test_details_open_keeps_catalog_lookup_and_no_wire_alias(api_client, isolated_db):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "DEAL_DETAILS_OPEN", "anonymous_session_id": "synthetic-session",
        "deal_slug": "unknown-synthetic-deal",
    }).status_code == 404
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "offer_details_opened", "anonymous_session_id": "synthetic-session",
    }).status_code == 422
    assert list(isolated_db.scalars(select(AnalyticsEvent))) == []
