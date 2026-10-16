from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from helpers import catalog_fixture
from sqlalchemy import select


def test_search_contract_filters_private_fields_and_deduplicates(api_client, isolated_db):
    catalog_fixture(isolated_db)
    payload = {"event_id": str(uuid4()), "event_name": "SEARCH_RESULT",
               "anonymous_session_id": "test-session", "source": "private@example.com",
               "metadata": {"campaign": "private-token", "email": "private@example.com"},
               "search": {"filters": {"origin": "WRO", "destination": "private-token",
                                      "budget": "300", "email": "private@example.com"},
                          "result_count": 1, "token": "private-token"}}
    for _ in range(2):
        assert api_client.post("/api/v1/analytics/events", json=payload).status_code == 202
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 1
    assert rows[0].source is None
    assert rows[0].metadata_json == {"search": {"filters": {"origin": "WRO", "budget": "300"}, "result_count": 1}}


@pytest.mark.parametrize("category,provider", [("flight", "catalog"), ("stay", "stay22"), ("activity", "tiqets")])
def test_partner_category_and_deal_id(api_client, isolated_db, category, provider):
    deal, _ = catalog_fixture(isolated_db)
    response = api_client.post("/api/v1/analytics/events", json={
        "event_name": "PARTNER_CLICK", "anonymous_session_id": "test-session", "deal_slug": deal.slug,
        "source": "newsletter", "metadata": {"campaign": "wro-weekend"},
        "partner": {"category": category, "provider": provider}})
    assert response.status_code == 202
    row = isolated_db.scalar(select(AnalyticsEvent))
    assert row.deal_id == deal.id
    assert row.metadata_json == {"campaign": "wro-weekend", "partner": {"category": category, "provider": provider}}


@pytest.mark.parametrize("extra", [
    {"event_name": "SEARCH_RESULT"},
    {"event_name": "SEARCH_RESULT", "search": {"filters": {}, "result_count": 0, "error": "unavailable"}},
    {"event_name": "SEARCH_RESULT", "search": {"filters": {}, "result_count": -1}},
    {"event_name": "PARTNER_CLICK"},
    {"event_name": "PARTNER_CLICK", "partner": {"category": "email", "provider": "stay22"}},
    {"event_name": "SUBSCRIPTION_CONFIRMED"},
])
def test_invalid_or_future_events_are_rejected(api_client, extra):
    assert api_client.post("/api/v1/analytics/events", json={"anonymous_session_id": "test-session", **extra}).status_code == 422


def test_error_is_not_zero_results(api_client, isolated_db):
    assert api_client.post("/api/v1/analytics/events", json={"event_name": "SEARCH_RESULT",
        "anonymous_session_id": "test-session", "search": {"filters": {}, "error": "unavailable"}}).status_code == 202
    row = isolated_db.scalar(select(AnalyticsEvent))
    assert row.metadata_json == {"search": {"filters": {}, "error": "unavailable"}}
