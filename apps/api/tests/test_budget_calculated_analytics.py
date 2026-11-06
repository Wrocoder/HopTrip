from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from sqlalchemy import select
from test_usage_dashboard import HEADERS


def test_budget_calculated_is_private_idempotent_and_distinct_from_budget_start(api_client, isolated_db):
    payload = {
        "event_id": str(uuid4()), "event_name": "BUDGET_CALCULATED",
        "anonymous_session_id": "synthetic-budget-session",
        "metadata": {"page_type": "budget", "total": "1234.56", "complete": True,
                     "token": "private-token", "plan_id": "private-plan"},
        "budget": {"total": "1234.56"}, "url": "/trip#plan=private-token",
    }
    for _ in range(2):
        response = api_client.post("/api/v1/analytics/events", json=payload)
        assert response.status_code == 202, response.text
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 1 and rows[0].event_name == "BUDGET_CALCULATED"
    assert rows[0].metadata_json == {"page_type": "budget"}
    assert rows[0].deal_id is None and rows[0].component is None
    now = datetime.now(UTC)
    params = {"start": (now - timedelta(days=1)).isoformat(),
              "end": (now + timedelta(days=1)).isoformat()}
    summary = api_client.get("/api/v1/admin/analytics/summary", params=params, headers=HEADERS)
    assert summary.status_code == 200
    assert summary.json()["by_event"] == {"BUDGET_CALCULATED": 1}
    usage = api_client.get("/api/v1/admin/analytics/usage", params=params, headers=HEADERS)
    assert usage.status_code == 200
    assert usage.json()["observed_events"] == 1 and usage.json()["excluded_events"] == 0
    assert next(m for m in usage.json()["metrics"] if m["key"] == "budget_usage")["numerator"] == 0


@pytest.mark.parametrize("context", [
    {"search": {"filters": {}}},
    {"partner": {"category": "flight", "provider": "catalog"}},
    {"filter": {"action": "apply"}},
    {"activity": {"city": "rome", "activity_id": "tiqets-1",
                  "page": "/info/rome", "link_kind": "affiliate"}},
])
def test_budget_calculated_rejects_unrelated_contexts(api_client, isolated_db, context):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "BUDGET_CALCULATED", "anonymous_session_id": "synthetic-session", **context,
    }).status_code == 422
    assert list(isolated_db.scalars(select(AnalyticsEvent))) == []


def test_budget_calculated_documentation_name_is_not_a_wire_alias(api_client):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "budget_calculated", "anonymous_session_id": "synthetic-session",
    }).status_code == 422
