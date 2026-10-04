from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.models.analytics import AnalyticsEvent
from sqlalchemy import select

HEADERS = {"X-Admin-Token": "change-me-in-development"}
CONTEXT = {"city": "milan", "activity_id": "tiqets-1111408", "page": "/info/milan-weekend", "link_kind": "affiliate"}


def test_activity_clicks_deduplicate_and_report_separately(api_client, isolated_db):
    payload = {"event_id": str(uuid4()), "event_name": "ACTIVITY_CLICK",
               "anonymous_session_id": "visitor-123", "activity": CONTEXT,
               "metadata": {"email": "discard@example.com", "activity": {"city": "fake"}}}
    for _ in range(2):
        assert api_client.post("/api/v1/analytics/events", json=payload).status_code == 202
    assert api_client.post("/api/v1/analytics/events", json={**payload, "event_id": str(uuid4())}).status_code == 202
    official = {"city": "oslo", "activity_id": "official-oslo", "page": "/deals/flight-test", "link_kind": "official"}
    assert api_client.post("/api/v1/analytics/events", json={**payload, "event_id": str(uuid4()), "activity": official}).status_code == 202
    event = isolated_db.scalar(select(AnalyticsEvent).where(AnalyticsEvent.event_id == payload["event_id"]))
    assert event.metadata_json == {"activity": CONTEXT}
    assert api_client.get("/api/v1/admin/analytics/summary").status_code == 401
    summary = api_client.get("/api/v1/admin/analytics/summary", headers=HEADERS).json()
    assert summary["total_activity_clicks"] == 3
    assert summary["activity_clicks"] == [{**CONTEXT, "clicks": 2, "sessions": 1}, {**official, "clicks": 1, "sessions": 1}]
    assert summary["confirmed_bookings"] == summary["total_affiliate_clicks"] == 0
    old = api_client.get("/api/v1/admin/analytics/summary", headers=HEADERS,
                         params={"end": (datetime.now(UTC)-timedelta(days=1)).isoformat()}).json()
    assert old["total_activity_clicks"] == 0
    assert old["activity_clicks"] == []


def test_activity_context_is_bounded_and_required(api_client):
    payload = {"event_name": "ACTIVITY_CLICK", "anonymous_session_id": "visitor-123"}
    assert api_client.post("/api/v1/analytics/events", json=payload).status_code == 422
    for field, value in [("city", "a"*81), ("activity_id", "email@example.com"),
                         ("page", "/info/milan-weekend?email=private"), ("link_kind", "booking")]:
        assert api_client.post("/api/v1/analytics/events", json={**payload, "activity": {**CONTEXT, field: value}}).status_code == 422
    assert api_client.post("/api/v1/analytics/events", json={**payload, "event_name": "PAGE_VIEW", "activity": CONTEXT}).status_code == 422
