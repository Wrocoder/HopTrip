from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from sqlalchemy import select


@pytest.mark.parametrize("name", ["TRIP_REMOVE", "EVENT_CLICK", "ALERT_STARTED"])
def test_new_actions_are_idempotent_and_keep_only_bounded_metadata(api_client, isolated_db, name):
    payload = {
        "event_id": str(uuid4()), "event_name": name, "anonymous_session_id": "synthetic-session",
        "metadata": {"page_type": "saved", "email": "private@example.test", "token": "private-token"},
        "email": "private@example.test", "url": "/trip?plan=private-token",
    }
    for _ in range(2):
        assert api_client.post("/api/v1/analytics/events", json=payload).status_code == 202
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 1
    assert rows[0].event_name == name
    assert rows[0].metadata_json == {"page_type": "saved"}
    assert rows[0].deal_id is None


@pytest.mark.parametrize("action", ["apply", "remove", "reset"])
def test_filter_actions_are_separate_from_search_and_drop_free_text(api_client, isolated_db, action):
    response = api_client.post("/api/v1/analytics/events", json={
        "event_name": "FILTER_USE", "anonymous_session_id": "synthetic-session",
        "filter": {"action": action, "value": "private@example.test"},
    })
    assert response.status_code == 202
    row = isolated_db.scalar(select(AnalyticsEvent))
    assert row.metadata_json == {"filter": {"action": action}}


def test_legacy_filter_event_remains_compatible(api_client, isolated_db):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": "FILTER_USE", "anonymous_session_id": "synthetic-session",
    }).status_code == 202
    assert isolated_db.scalar(select(AnalyticsEvent)).metadata_json == {}


@pytest.mark.parametrize("extra", [
    {"event_name": "FILTER_USE", "filter": {"action": "private@example.test"}},
    {"event_name": "FILTER_USE", "filter": {}},
    {"event_name": "TRIP_REMOVE", "filter": {"action": "remove"}},
    {"event_name": "ALERT_STARTED", "search": {"filters": {"origin": "WRO"}}},
    {"event_name": "EVENT_CLICK", "partner": {"category": "activity", "provider": "tiqets"}},
    {"event_name": "TRIP_REMOVE", "activity": {"city": "rome", "activity_id": "tiqets-1", "page": "/info/rome", "link_kind": "affiliate"}},
    {"event_name": "trip_removed"},
])
def test_new_taxonomy_rejects_wrong_contexts_and_undocumented_wire_aliases(api_client, isolated_db, extra):
    assert api_client.post("/api/v1/analytics/events", json={
        "anonymous_session_id": "synthetic-session", **extra,
    }).status_code == 422
    assert list(isolated_db.scalars(select(AnalyticsEvent))) == []
