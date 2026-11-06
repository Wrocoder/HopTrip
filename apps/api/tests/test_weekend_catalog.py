from datetime import UTC, datetime, timedelta
from decimal import Decimal
from time import perf_counter

import pytest
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.schemas.weekend import WorkHours
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.deals import generate_flight_deal
from app.services.flight_routes import ticket_key
from app.services.weekend_catalog import weekend_matches
from sqlalchemy import event
from test_return_routes import route_fixture


@pytest.fixture
def catalog(isolated_db):
    db = isolated_db
    template, _ = route_fixture(db)
    now = datetime.now(UTC)

    def create(price, *, start="2030-11-01T18:00:00+01:00",
               back="2030-11-03T19:00:00Z", home="WRO", kind="known"):
        depart, returning = datetime.fromisoformat(start), datetime.fromisoformat(back)
        outbound_arrival, return_arrival = depart + timedelta(hours=2), returning + timedelta(hours=2)
        link = f"/search/fixture?t=synthetic-{price}-{start}-{back}"
        payload = dict(origin="WRO", destination="LON", origin_airport="WRO", destination_airport="STN",
            departure_at=start, return_at=back, return_origin_airport="LTN", return_destination_airport=home,
            price=price, currency="PLN", airline="FR",
            flight_number="8406", transfers=0, return_transfers=0, link=link)
        if kind != "unknown":
            payload.update(duration_to=120, duration_back=120)
        offer = TravelOffer(data_provider_id=template.data_provider_id, external_id=link,
            source="travelpayouts_data", departure_precision="TIME",
            origin_airport_id=template.origin_airport_id, destination_id=template.destination_id,
            depart_at=depart.astimezone(UTC), return_at=returning.astimezone(UTC), original_price=Decimal(price),
            original_currency="PLN", price_pln=Decimal(price), raw_payload=payload,
            last_verified_at=now, fetched_at=now, expires_at=now + timedelta(hours=24))
        if kind == "known":
            offer.route_details = dict(source="travelpayouts_graphql", ticket_key=ticket_key(link),
                departure_at=start, return_at=return_arrival.isoformat(), value=price,
                currency="PLN", origin_airport_iata="WRO", destination_airport_iata="STN",
                segments=[dict(departure_at=start, arrival_at=outbound_arrival.isoformat(),
                    flight_legs=[dict(origin="WRO", destination="STN", departure_at=start,
                        arrival_at=outbound_arrival.isoformat(), operating_carrier="FR")]),
                    dict(departure_at=back, arrival_at=return_arrival.isoformat(),
                    flight_legs=[dict(origin="LTN", destination=home, departure_at=back,
                        arrival_at=return_arrival.isoformat(), operating_carrier="FR")])])
        db.add(offer)
        db.flush()
        deal = generate_flight_deal(db, offer, now)
        db.commit()
        assert deal is not None
        view = serialize_deal(db, deal)
        assert view.flight_quality.recommendation_eligible, view.flight_quality
        return deal

    return create


def result(api_client, **params):
    response = api_client.get("/api/v1/deals", params={"include_total": "true", **params})
    assert response.status_code == 200, response.text
    return response.json()


def test_filter_runs_before_pagination_and_counts_all_matches(api_client, isolated_db, catalog):
    unknown = catalog(100, kind="unknown")
    morning = catalog(150, start="2030-11-01T08:00:00+01:00")
    evening = catalog(200)
    monday = catalog(250, back="2030-11-03T23:00:00Z")
    monday_departure = catalog(300, back="2030-11-04T19:00:00Z")
    second = catalog(350)
    params = {"weekend_mode": "no-leave-v1", "limit": 1}
    first = result(api_client, **params)
    assert first["total"] == 2 and first["items"][0]["id"] == evening.id
    assert first["items"][0]["weekend_assessment"]["no_leave"] == "ELIGIBLE"
    page2 = result(api_client, **params, offset=1)
    assert page2["total"] == 2 and page2["items"][0]["id"] == second.id
    empty = result(api_client, **params, offset=2)
    assert empty["total"] == 2 and empty["items"] == []
    plain = api_client.get("/api/v1/deals", params={**params, "offset": 1}).json()
    assert [d["id"] for d in plain] == [second.id]
    legacy = result(api_client, weekend="true")
    assert {d["id"] for d in legacy["items"]} == {unknown.id, morning.id, evening.id, monday.id, second.id}
    calendar = result(api_client, weekend_mode="calendar-v1")
    assert calendar["total"] == 5
    flexible = result(api_client, weekend_mode="flexible-v1")
    assert flexible["total"] == 6
    assert monday_departure.id in [d["id"] for d in flexible["items"]]
    # The batched gate and the public serializer must agree on every assessment.
    matches = weekend_matches(isolated_db, available_deals_query().order_by(None), "calendar-v1", WorkHours())
    for deal, assessment in matches:
        assert assessment == serialize_deal(isolated_db, deal).weekend_assessment


def test_custom_hours_change_filter_and_returned_assessment(api_client, catalog):
    deal = catalog(200, start="2030-11-01T16:00:00+01:00")
    assert result(api_client, weekend_mode="no-leave-v1")["total"] == 0
    custom = result(api_client, weekend_mode="no-leave-v1", work_start="07:00", work_end="15:00")
    assert custom["items"][0]["id"] == deal.id
    assert custom["items"][0]["weekend_assessment"]["work_hours"] == {"start": "07:00:00", "end": "15:00:00"}
    # The request must not leak custom assumptions to the detail/default response.
    assert api_client.get(f"/api/v1/deals/{deal.slug}").json()["weekend_assessment"]["no_leave"] == "INELIGIBLE"


@pytest.mark.parametrize("sort", ["price", "departure", "score"])
def test_public_order_and_tie_breaks_survive_metadata_join(api_client, isolated_db, catalog, sort):
    deals = [catalog(200), catalog(100), catalog(300)]
    # Prices intentionally differ from insertion order; all tie on date/score.
    deals[0].deal_score, deals[1].deal_score, deals[2].deal_score = 50, 25, 75
    isolated_db.commit()
    expected = ([deals[2].id, deals[0].id, deals[1].id] if sort == "score"
                else [deals[1].id, deals[0].id, deals[2].id])
    page = result(api_client, weekend_mode="no-leave-v1", sort=sort, offset=1, limit=1)
    assert page["total"] == 3 and [d["id"] for d in page["items"]] == expected[1:2]


def test_join_fanout_does_not_consume_candidate_limit(api_client, isolated_db, catalog, monkeypatch):
    from app.models.location import DestinationAlias
    from app.services import weekend_catalog

    deal = catalog(200)
    for index in range(5):
        isolated_db.add(DestinationAlias(destination_id=deal.destination_id,
            provider_code=f"synthetic-{index}", code="LON", kind="CITY"))
    isolated_db.commit()
    monkeypatch.setattr(weekend_catalog, "MAX_WEEKEND_CANDIDATES", 1)
    page = result(api_client, weekend_mode="no-leave-v1")
    assert page["total"] == 1 and page["items"][0]["id"] == deal.id


@pytest.mark.parametrize("change", [
    {"budget": "199.99"}, {"duration_min": "3"}, {"duration_max": "1"},
    {"departure_from": "2030-11-02"}, {"departure_to": "2030-10-31"},
])
def test_ordinary_filters_remain_intersections(api_client, catalog, change):
    catalog(200)
    assert result(api_client, weekend_mode="no-leave-v1", **change)["total"] == 0


@pytest.mark.parametrize("params,code", [
    ({"weekend_mode": "no-leave-v2"}, None),
    ({"weekend_mode": "no-leave-v1", "weekend": "true"}, "CONFLICTING_WEEKEND_FILTERS"),
    ({"work_start": "09:00"}, "WORK_HOURS_REQUIRE_NO_LEAVE"),
    ({"weekend_mode": "calendar-v1", "work_end": "17:00"}, "WORK_HOURS_REQUIRE_NO_LEAVE"),
    ({"weekend_mode": "no-leave-v1", "work_start": "18:00", "work_end": "09:00"}, "INVALID_WORK_HOURS"),
    ({"weekend_mode": "no-leave-v1", "work_start": "17:00"}, "INVALID_WORK_HOURS"),
    ({"weekend_mode": "no-leave-v1", "work_start": "09:00Z"}, "INVALID_WORK_HOURS"),
    ({"weekend_mode": "no-leave-v1", "work_start": "25:00"}, None),
])
def test_invalid_or_conflicting_contract_is_422(api_client, params, code):
    response = api_client.get("/api/v1/deals", params=params)
    assert response.status_code == 422
    if code:
        assert response.json()["detail"]["code"] == code


@pytest.mark.parametrize("kind,home", [("unknown", "WRO"), ("estimated", "WRO"), ("known", "KRK")])
def test_unknown_estimated_or_other_home_airport_is_not_no_leave(api_client, catalog, kind, home):
    catalog(200, kind=kind, home=home)
    assert result(api_client, weekend_mode="calendar-v1")["total"] == 1
    assert result(api_client, weekend_mode="no-leave-v1")["total"] == 0


def test_multiple_flight_components_cannot_certify_a_convenient_offer(api_client, isolated_db, catalog):
    deal = catalog(200)
    component = isolated_db.query(DealComponent).filter_by(deal_id=deal.id).one()
    isolated_db.add(DealComponent(deal_id=deal.id, component_type="FLIGHT",
                                 travel_offer_id=component.travel_offer_id, price_pln=200))
    isolated_db.commit()
    assert result(api_client, weekend_mode="calendar-v1")["total"] == 0


def test_broad_query_is_explicit_error_not_a_partial_total(api_client, catalog, monkeypatch):
    from app.services import weekend_catalog

    catalog(200)
    catalog(300)
    monkeypatch.setattr(weekend_catalog, "MAX_WEEKEND_CANDIDATES", 1)
    response = api_client.get("/api/v1/deals?weekend_mode=no-leave-v1&limit=1")
    assert response.status_code == 422 and response.json()["detail"]["code"] == "WEEKEND_QUERY_TOO_BROAD"
    assert result(api_client, weekend_mode="no-leave-v1", budget=200)["total"] == 1
    assert result(api_client)["total"] == 2  # Legacy requests have no new cap.


def test_candidate_sql_count_is_constant_and_does_not_serialize_full_catalog(isolated_db, catalog):
    catalog(200)
    engine = isolated_db.get_bind()
    statements = []

    def record(*args):
        statements.append(args[2])

    def check():
        statements.clear()
        event.listen(engine, "before_cursor_execute", record)
        try:
            started = perf_counter()
            matches = weekend_matches(isolated_db, available_deals_query(), "no-leave-v1", WorkHours())
            duration = perf_counter() - started
        finally:
            event.remove(engine, "before_cursor_execute", record)
        assert len(statements) == 1
        return len(matches), duration

    assert check()[0] == 1
    for price in range(201, 251):
        catalog(price)
    count, duration = check()
    assert count == 51
    print(f"weekend exact gate: {count} candidates, 1 SQL statement, {duration:.3f}s")
