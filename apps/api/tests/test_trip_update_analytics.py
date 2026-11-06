from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from sqlalchemy import select
from test_usage_dashboard import HEADERS


def test_trip_update_is_idempotent_private_and_visible_in_existing_reports(api_client, isolated_db):
    payload = {
        "event_id": str(uuid4()), "event_name": "TRIP_UPDATE",
        "anonymous_session_id": "synthetic-update-session",
        "metadata": {"page_type": "saved_trip", "plan_id": "private-plan",
                     "revision": 2, "token": "private-token", "budget": "999.99"},
        "plan_id": "private-plan", "token": "private-token", "revision": 2,
    }
    for _ in range(2):
        response = api_client.post("/api/v1/analytics/events", json=payload)
        assert response.status_code == 202, response.text
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 1 and rows[0].event_name == "TRIP_UPDATE"
    assert rows[0].metadata_json == {"page_type": "saved_trip"}
    assert rows[0].deal_id is None and rows[0].component is None
    now = datetime.now(UTC)
    params = {"start": (now - timedelta(days=1)).isoformat(),
              "end": (now + timedelta(days=1)).isoformat()}
    summary = api_client.get("/api/v1/admin/analytics/summary", params=params, headers=HEADERS)
    assert summary.status_code == 200
    assert summary.json()["by_event"] == {"TRIP_UPDATE": 1}
    usage = api_client.get("/api/v1/admin/analytics/usage", params=params, headers=HEADERS)
    assert usage.status_code == 200
    assert usage.json()["observed_events"] == 1
    assert usage.json()["observed_sessions"] == 1
    assert usage.json()["excluded_events"] == 0
    assert all(step["sessions"] == 0 for step in usage.json()["ordered_funnel"]["steps"])
    assert next(m for m in usage.json()["metrics"] if m["key"] == "trip_save")["numerator"] == 0


@pytest.mark.parametrize("context", [
    {"search": {"filters": {}}},
    {"partner": {"category": "flight", "provider": "catalog"}},
    {"filter": {"action": "apply"}},
    {"activity": {"city": "rome", "activity_id": "tiqets-1",
                  "page": "/info/rome", "link_kind": "affiliate"}},
])
def test_trip_update_rejects_unrelated_contexts(api_client, isolated_db, context):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "TRIP_UPDATE", "anonymous_session_id": "synthetic-session", **context,
    }).status_code == 422
    assert list(isolated_db.scalars(select(AnalyticsEvent))) == []


def test_documentation_name_is_not_a_wire_alias(api_client):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "trip_updated", "anonymous_session_id": "synthetic-session",
    }).status_code == 422
