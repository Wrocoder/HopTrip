from uuid import uuid4

import pytest
from app.models.analytics import AnalyticsEvent
from sqlalchemy import select
from test_usage_dashboard import add, get


def test_local_shared_and_reload_causes_are_not_distinguishable_in_stored_views(api_client, isolated_db):
    for plan, cause in [("private-a", "reload"), ("private-b", "local-open"),
                        ("private-shared-token", "share-open")]:
        assert api_client.post("/api/v1/analytics/events", json={
            "event_id": str(uuid4()), "event_name": "PAGE_VIEW",
            "anonymous_session_id": "synthetic-same-session",
            "metadata": {"page_type": "saved_trip", "plan_id": plan, "navigation_cause": cause},
            "plan_id": plan, "url": "/trip#local=" + plan,
        }).status_code == 202
    rows = list(isolated_db.scalars(select(AnalyticsEvent)))
    assert len(rows) == 3
    assert all(row.metadata_json == {"page_type": "saved_trip"} and row.deal_id is None
               and row.component is None and row.source is None for row in rows)
    assert len({row.anonymous_session_id for row in rows}) == 1


def test_save_auto_open_and_later_session_do_not_prove_a_returning_person(api_client, isolated_db):
    add(isolated_db, "TRIP_SAVE", "synthetic-before", 0)
    add(isolated_db, "PAGE_VIEW", "synthetic-before", 1, metadata={"page_type": "saved_trip"})
    add(isolated_db, "PAGE_VIEW", "synthetic-after", 1802, metadata={"page_type": "saved_trip"})
    isolated_db.commit()
    body = get(api_client).json()
    assert body["observed_sessions"] == 2
    rows = {row["key"]: row for row in body["metrics"]}
    assert rows["trip_save"]["numerator"] == 1
    assert rows["returning_visitors"]["status"] == "unavailable"
    assert rows["returning_visitors"]["numerator"] is None
    assert rows["returning_visitors"]["denominator"] is None
    assert rows["returning_visitors"]["percent"] is None


@pytest.mark.parametrize("name", ["TRIP_REVISIT", "PLAN_REOPEN", "trip_revisited"])
def test_no_unimplemented_revisit_event_alias_is_accepted(api_client, isolated_db, name):
    assert api_client.post("/api/v1/analytics/events", json={
        "event_name": name, "anonymous_session_id": "synthetic-session",
    }).status_code == 422
    assert list(isolated_db.scalars(select(AnalyticsEvent))) == []
