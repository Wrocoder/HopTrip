import asyncio
import json
from copy import deepcopy
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import httpx
import pytest
from app.models.location import Destination
from app.models.offer import PriceObservation, TravelOffer
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.providers.travelpayouts_routes import TravelpayoutsRouteProvider
from app.services.deals import generate_flight_deal
from app.services.flight_facts import flight_facts
from app.services.flight_routes import ticket_key, validated_segments
from app.services.route_enrichment import enrich_routes
from app.services.trip_dates import trip_dates
from sqlalchemy import select
from test_lifecycle import NOW, ingest, setup


def route_fixture(db):
    setup(db)
    city = db.scalar(select(Destination))
    city.iata_code, city.slug, city.city = "LON", "london", "London"
    db.commit()
    payload = dict(origin="WRO", destination="LON", origin_airport="WRO", destination_airport="STN",
                   departure_at="2030-11-01T13:00:00+01:00", return_at="2030-11-04T22:30:00Z",
                   price=209, currency="PLN", airline="FR", flight_number="8406",
                   transfers=0, return_transfers=0, duration_to=120, duration_back=120,
                   link="/search/WRO0111LON04111?t=opaque-selected-ticket&marker=private")
    raw = TravelpayoutsDataProvider(token="fixture")._normalize(payload, SearchQuery(origin="WRO"))
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    row = dict(departure_at=payload["departure_at"], return_at="2030-11-05T01:30:00+01:00",
               origin_airport_iata="WRO", destination_airport_iata="STN", value=208.81,
               currency="pln", ticket_link="/WRO0111LON04111?t=opaque-selected-ticket")
    row["segments"] = [
        dict(departure_at=payload["departure_at"], arrival_at="2030-11-01T14:00:00Z",
             flight_legs=[dict(origin="WRO", destination="STN", departure_at=payload["departure_at"],
                               arrival_at="2030-11-01T14:00:00Z", operating_carrier="FR", flight_number="8406")]),
        dict(departure_at="2030-11-04T22:30:00Z", arrival_at=row["return_at"],
             flight_legs=[dict(origin="LTN", destination="WRO", departure_at="2030-11-04T22:30:00Z",
                               arrival_at=row["return_at"], operating_carrier="W6", flight_number="1234")]),
    ]
    return offer, row


def provider_for(row, requests=None):
    def respond(request):
        if requests is not None:
            requests.append(json.loads(request.content))
        return httpx.Response(200, json={"data": {"prices_round_trip": [row]}})
    return TravelpayoutsRouteProvider(token="private", interval=0, transport=httpx.MockTransport(respond))


def evidence(row):
    return {**{k: v for k, v in row.items() if k != "ticket_link"},
            "source": "travelpayouts_graphql", "ticket_key": ticket_key(row["ticket_link"])}


def test_exact_structured_return_keeps_airports_times_carrier_and_price_separate(isolated_db):
    db = isolated_db
    offer, row = route_fixture(db)
    original_payload = deepcopy(offer.raw_payload)
    snapshot = (offer.original_price, offer.price_pln, offer.last_verified_at, offer.fetched_at,
                offer.expires_at, db.query(PriceObservation).count())
    requests = []
    result = asyncio.run(enrich_routes(db, provider_for(row, requests), NOW))
    assert result.enriched == 1 and result.requests == 1
    assert requests[0]["variables"]["params"] == {
        "origin": "WRO", "origin_type": "AIRPORT", "depart_dates": ["2030-11-01"],
        "destination": "LON", "destination_type": "CITY"}
    facts = flight_facts(offer)
    assert facts.destination_airport == "STN"
    assert (facts.return_origin_airport, facts.return_destination_airport) == ("LTN", "WRO")
    assert facts.return_departure == datetime(2030, 11, 4, 22, 30, tzinfo=UTC)
    assert facts.return_arrival == datetime(2030, 11, 5, 0, 30, tzinfo=UTC)
    assert facts.return_legs[0].airline_code == "W6" and facts.outbound_legs[0].airline_code == "FR"
    assert not facts.return_arrival_calculated and not facts.outbound_arrival_calculated
    assert trip_dates(offer)[1].isoformat() == "2030-11-04"  # not arrival home on Nov 5
    assert offer.raw_payload == original_payload
    assert (offer.original_price, offer.price_pln, offer.last_verified_at, offer.fetched_at,
            offer.expires_at, db.query(PriceObservation).count()) == snapshot
    assert "private" not in str(facts.model_dump())
    assert asyncio.run(enrich_routes(db, provider_for(row), NOW)).already_known == 1


@pytest.mark.parametrize("bad", ["other_ticket", "other_date", "other_price", "currency", "airport",
                                  "naive_time", "reversed_time", "stops", "duration", "incomplete", "bad_currency"])
def test_nonmatching_or_broken_route_never_fills_return_airports(isolated_db, bad):
    offer, row = route_fixture(isolated_db)
    if bad == "other_ticket":
        row["ticket_link"] += "-different"
    elif bad == "other_date":
        row["return_at"] = "2030-11-06T00:30:00Z"
    elif bad == "other_price":
        row["value"] = 661
    elif bad == "currency":
        row["currency"] = "eur"
    elif bad == "airport":
        row["segments"][1]["flight_legs"][0]["origin"] = "London"
    elif bad == "naive_time":
        row["segments"][1]["departure_at"] = "2030-11-04T22:30:00"
    elif bad == "reversed_time":
        row["segments"][1]["flight_legs"][0]["arrival_at"] = "2030-11-04T20:30:00Z"
    elif bad == "stops":
        offer.raw_payload = {**offer.raw_payload, "return_transfers": 1}
    elif bad == "duration":
        row["segments"][1]["arrival_at"] = "2030-11-05T12:30:00Z"
    elif bad == "incomplete":
        row["segments"].pop()
    elif bad == "bad_currency":
        row["currency"] = None
    result = asyncio.run(enrich_routes(isolated_db, provider_for(row), NOW))
    assert result.enriched == 0
    assert flight_facts(offer).return_origin_airport is None
    assert flight_facts(offer).return_departure == datetime(2030, 11, 4, 22, 30, tzinfo=UTC)


def test_route_evidence_is_invalidated_when_original_ticket_changes(isolated_db):
    offer, row = route_fixture(isolated_db)
    offer.route_details = evidence(row)
    assert validated_segments(offer, offer.route_details)
    offer.raw_payload = {**offer.raw_payload, "link": "/search/WRO0111LON04111?t=another-ticket"}
    assert flight_facts(offer).return_legs == []
    assert flight_facts(offer).return_origin_airport is None


@pytest.mark.parametrize("kind", ["rate_limit", "denied", "graphql_error", "invalid_json", "invalid_body"])
def test_route_provider_failure_preserves_cached_price_and_does_not_raise(isolated_db, kind):
    offer, row = route_fixture(isolated_db)
    def respond(request):
        if kind == "rate_limit":
            return httpx.Response(429)
        if kind == "denied":
            return httpx.Response(403)
        if kind == "graphql_error":
            return httpx.Response(200, json={"errors": [{"message": "private"}], "data": {"prices_round_trip": [row]}})
        if kind == "invalid_body":
            return httpx.Response(200, json=[])
        return httpx.Response(200, text="private")
    p = TravelpayoutsRouteProvider(token="private", interval=0, transport=httpx.MockTransport(respond))
    result = asyncio.run(enrich_routes(isolated_db, p, NOW))
    assert result.groups_failed == 1 and result.enriched == 0
    assert offer.original_price == Decimal(209)
    assert "private" not in str(result)


def test_expired_offer_does_not_trigger_enrichment_or_price_renewal(isolated_db):
    offer, row = route_fixture(isolated_db)
    result = asyncio.run(enrich_routes(isolated_db, provider_for(row), NOW + timedelta(hours=49)))
    assert result.requests == 0 and offer.route_details is None


def test_structured_return_reaches_deal_dates_and_both_public_endpoints(api_client, isolated_db):
    offer, row = route_fixture(isolated_db)
    now = datetime.now(UTC)
    offer.last_verified_at, offer.fetched_at, offer.expires_at = now, now, now + timedelta(hours=48)
    offer.route_details = evidence(row)
    isolated_db.commit()
    deal = generate_flight_deal(isolated_db, offer, now)
    detail = api_client.get("/api/v1/deals/" + deal.slug)
    assert detail.status_code == 200
    body = detail.json()
    assert body["trip_end"] == "2030-11-04" and body["nights"] == 3
    assert body["flight_facts"]["return_departure"] == "2030-11-04T22:30:00Z"
    assert body["flight_facts"]["return_origin_airport"] == "LTN"
    assert body["flight_facts"]["return_legs"][0]["flight_number"] == "1234"
    listing = api_client.get("/api/v1/deals").json()
    assert next(d for d in listing if d["slug"] == deal.slug)["flight_facts"] == body["flight_facts"]
    assert "ticket_key" not in detail.text and "private" not in detail.text


def test_rest_departure_and_graphql_arrival_use_their_own_source_contracts(isolated_db):
    offer, _ = route_fixture(isolated_db)
    facts = flight_facts(offer)
    assert facts.return_departure == datetime(2030, 11, 4, 22, 30, tzinfo=UTC)
    assert facts.return_arrival == datetime(2030, 11, 5, 0, 30, tzinfo=UTC)
    assert facts.return_arrival_calculated and facts.return_origin_airport is None


def test_connection_legs_keep_both_airports_and_operating_carriers(isolated_db):
    offer, row = route_fixture(isolated_db)
    offer.raw_payload = {**offer.raw_payload, "return_transfers": 1, "duration_back": 90}
    row["segments"][1]["flight_legs"] = [
        dict(origin="LTN", destination="BER", departure_at="2030-11-04T22:30:00Z",
             arrival_at="2030-11-04T23:15:00Z", operating_carrier="W6", flight_number="1234"),
        dict(origin="BER", destination="WRO", departure_at="2030-11-04T23:45:00Z",
             arrival_at="2030-11-05T01:30:00+01:00", operating_carrier="LO", flight_number="999"),
    ]
    offer.route_details = evidence(row)
    facts = flight_facts(offer)
    assert facts.return_stops == 1
    assert [(leg.origin_airport, leg.destination_airport, leg.airline_code)
            for leg in facts.return_legs] == [("LTN", "BER", "W6"), ("BER", "WRO", "LO")]


def test_event_fit_uses_actual_departure_not_later_arrival_home(isolated_db):
    from datetime import date, time

    from app.schemas.event import EventRead
    from app.services.event_flight_fit import event_flight_fit

    offer, row = route_fixture(isolated_db)
    offer.route_details = evidence(row)
    event = EventRead(id="late", name="Late concert", start_date=date(2030, 11, 4),
                      local_time=time(23), timezone="Europe/London", status="onsale",
                      category="MUSIC", venue="Venue", city="London", url="https://example.com/event")
    fit = event_flight_fit(event, flight_facts(offer), date(2030, 11, 1), date(2030, 11, 4))
    assert fit.status == "CONFLICT" and "AFTER_RETURN" in fit.reasons


@pytest.mark.parametrize("missing", ["departure_at", "origin_airport", "destination_airport"])
def test_legacy_incomplete_payload_cannot_crash_or_trigger_an_unanchored_lookup(isolated_db, missing):
    offer, row = route_fixture(isolated_db)
    payload = dict(offer.raw_payload)
    payload.pop(missing)
    offer.raw_payload = payload
    isolated_db.commit()
    assert asyncio.run(enrich_routes(isolated_db, provider_for(row), NOW)).requests == 0


def test_graphql_400_record_limit_and_next_page_offset_are_respected(isolated_db):
    import re

    offer, row = route_fixture(isolated_db)
    offsets = []
    def respond(request):
        body = json.loads(request.content)
        limit = int(re.search(r"limit:(\d+)", body["query"])[1])
        offset = body["variables"]["offset"]
        offsets.append(offset)
        if limit > 400 or offset not in (0, 400):
            return httpx.Response(400, json={"errors": [{"message": "limit must be equal or less than 400"}]})
        rows = [dict(row, ticket_link=f"/other?t=other-{i}") for i in range(400)] if offset == 0 else [row]
        return httpx.Response(200, json={"data": {"prices_round_trip": rows}})
    p = TravelpayoutsRouteProvider(token="private", interval=0, transport=httpx.MockTransport(respond))
    result = asyncio.run(enrich_routes(isolated_db, p, NOW))
    assert offsets == [0, 400] and result.enriched == 1 and result.requests == 2
    assert flight_facts(offer).return_origin_airport == "LTN"


def test_graphql_departure_dates_are_batched_within_five_date_limit(isolated_db):
    offer, _ = route_fixture(isolated_db)
    for index in range(1, 6):
        departure = offer.depart_at.replace(tzinfo=UTC) + timedelta(days=index)
        isolated_db.add(TravelOffer(
            data_provider_id=offer.data_provider_id, external_id=f"chunk-{index}", source=offer.source,
            product_type="FLIGHT", departure_precision="TIME", depart_at=departure,
            return_at=departure + timedelta(days=3), original_price=209, original_currency="PLN",
            last_verified_at=NOW, fetched_at=NOW, expires_at=NOW + timedelta(hours=48),
            raw_payload={**offer.raw_payload, "departure_at": departure.isoformat(),
                         "link": f"/search/fixture?t=chunk-{index}"}))
    isolated_db.commit()
    batches = []
    def respond(request):
        params = json.loads(request.content)["variables"]["params"]
        batches.append(params["depart_dates"])
        if len(params["depart_dates"]) > 5:
            return httpx.Response(400, json={"errors": [{"message": "depart_dates maximum 5"}]})
        return httpx.Response(200, json={"data": {"prices_round_trip": []}})
    p = TravelpayoutsRouteProvider(token="private", interval=0, transport=httpx.MockTransport(respond))
    result = asyncio.run(enrich_routes(isolated_db, p, NOW))
    assert [len(batch) for batch in batches] == [5, 1]
    assert len(set(day for batch in batches for day in batch)) == 6
    assert result.groups_failed == 0


def test_missing_segments_do_not_treat_airborne_time_as_total_with_layovers(isolated_db):
    offer, _ = route_fixture(isolated_db)
    offer.raw_payload = {**offer.raw_payload, "transfers": 1, "return_transfers": 1}
    facts = flight_facts(offer)
    assert facts.outbound_arrival is None and facts.return_arrival is None
    assert facts.return_departure is not None


def test_source_offset_retains_return_calendar_day_when_airport_zone_is_unknown(isolated_db):
    offer, row = route_fixture(isolated_db)
    segment = row["segments"][1]
    segment["departure_at"] = "2030-11-05T01:30:00+03:00"
    segment["flight_legs"][0].update(origin="ZZZ", departure_at=segment["departure_at"])
    offer.route_details = evidence(row)
    facts = flight_facts(offer)
    assert facts.return_origin_timezone is None
    assert facts.return_departure.isoformat() == "2030-11-05T01:30:00+03:00"
    assert trip_dates(offer)[1].isoformat() == "2030-11-05"


def test_unmatched_ticket_retry_does_not_starve_other_routes_or_invent_unavailability(isolated_db):
    offer, row = route_fixture(isolated_db)
    missing = dict(row, ticket_link="/other?t=other-ticket")
    first = asyncio.run(enrich_routes(isolated_db, provider_for(missing), NOW))
    assert first.unmatched == 1 and offer.route_details["status"] == "INCONCLUSIVE"
    assert flight_facts(offer).return_origin_airport is None
    deferred = asyncio.run(enrich_routes(isolated_db, provider_for(row), NOW + timedelta(minutes=59)))
    assert deferred.deferred == 1 and deferred.requests == 0
    retried = asyncio.run(enrich_routes(isolated_db, provider_for(row), NOW + timedelta(hours=1)))
    assert retried.enriched == 1 and retried.deferred == 0
    assert flight_facts(offer).return_origin_airport == "LTN"
