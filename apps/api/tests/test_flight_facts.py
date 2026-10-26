from datetime import UTC, datetime

import pytest
from app.models.data_provider import DataProvider
from app.models.offer import TravelOffer
from app.services.catalog import serialize_deal
from app.services.flight_facts import flight_facts
from app.services.flight_reference import airline_name, airport_timezone
from helpers import catalog_fixture


def offer(**changes):
    return TravelOffer(
        source=changes.pop("source", "travelpayouts_data"),
        product_type="FLIGHT",
        departure_precision=changes.pop("departure_precision", "TIME"),
        depart_at=datetime(2030, 3, 30, 22, tzinfo=UTC),
        return_at=changes.pop("return_at", datetime(2030, 3, 31, 10, tzinfo=UTC)),
        raw_payload=changes,
    )


def test_offset_and_dst_interval_uses_elapsed_time_and_independent_legs():
    facts = flight_facts(offer(
        origin_airport="WRO", destination="MIL", destination_airport="BGY", airline="FR",
        departure_at="2030-03-30T23:00:00+01:00", duration_to=120,
        transfers=0, return_transfers=1,
    ))
    assert facts.destination_code == "MIL"
    assert facts.destination_airport == "BGY"
    assert facts.outbound_arrival == datetime(2030, 3, 31, tzinfo=UTC)
    assert facts.outbound_stops == 0 and facts.return_stops == 1
    timed = offer()
    timed.raw_payload = {
        "departure_at": "2030-03-30T23:00:00+01:00", "duration_to": 120,
        "transfers": 0, "return_transfers": 0,
        "return_at": "2030-03-31T12:00:00+02:00", "duration_back": 90,
    }
    facts = flight_facts(timed)
    assert facts.destination_interval_minutes == 600
    assert facts.return_arrival == datetime(2030, 3, 31, 11, 30, tzinfo=UTC)


@pytest.mark.parametrize("bad", [None, True, -1, 1.5, "0", {}, 999999])
def test_invalid_counts_are_unknown(bad):
    facts = flight_facts(offer(transfers=bad, return_transfers=bad, duration_to=bad))
    assert facts.outbound_stops is None and facts.return_stops is None
    assert facts.outbound_arrival is None


@pytest.mark.parametrize("stamp", ["2030-03-30", "2030-03-30T10:00:00", "invalid"])
def test_date_only_naive_and_invalid_times_are_not_schedule(stamp):
    facts = flight_facts(offer(departure_at=stamp, duration_to=90))
    assert facts.outbound_departure is None
    assert facts.outbound_arrival is None
    assert facts.destination_interval_minutes is None


def test_untrusted_source_date_precision_missing_airport_and_one_way():
    assert flight_facts(offer(source="fixture", airline="FR")).airline_code is None
    facts = flight_facts(offer(
        departure_precision="DATE", departure_at="2030-03-30T00:00:00Z",
        destination="MIL", airline="<script>", return_at=None, return_transfers=0,
    ))
    assert facts.outbound_departure is None
    assert facts.destination_code == "MIL" and facts.destination_airport is None
    assert facts.airline_code is None and facts.return_stops is None
    assert facts.return_departure is None


def test_impossible_interval_is_not_published():
    timed = offer()
    timed.raw_payload = {
        "departure_at": "2030-03-30T23:00:00Z", "duration_to": 120,
        "return_at": "2030-03-30T23:30:00Z",
    }
    assert flight_facts(timed).destination_interval_minutes is None


def test_public_contract_and_non_flight_component(api_client, isolated_db):
    deal, component = catalog_fixture(isolated_db)
    provider = DataProvider(code="facts-test", name="Local fixture")
    isolated_db.add(provider)
    isolated_db.flush()
    flight = offer(destination="MIL", destination_airport="BGY", airline="FR", transfers=0)
    flight.data_provider_id = provider.id
    flight.external_id = "facts"
    flight.original_price = 200
    flight.original_currency = "PLN"
    flight.raw_payload["secret"] = "never-public"
    isolated_db.add(flight)
    isolated_db.flush()
    component.travel_offer_id = flight.id
    isolated_db.commit()
    response = api_client.get("/api/v1/deals/" + deal.slug)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_type"] == "ROUND_TRIP"
    assert body["flight_facts"]["origin_airport"] is None
    assert body["flight_facts"]["origin_timezone"] is None
    assert body["flight_facts"]["return_origin_airport"] is None
    assert body["flight_facts"]["return_destination_airport"] is None
    assert body["flight_facts"]["destination_airport"] == "BGY"
    assert body["flight_facts"]["airline_code"] == "FR"
    assert "secret" not in response.text
    component.component_type = "HOTEL"
    isolated_db.commit()
    result = serialize_deal(isolated_db, deal)
    assert result.trip_type == "ONE_WAY"
    assert result.flight_facts.airline_code is None


def test_midnight_home_arrival_preserves_payload_and_elapsed_duration():
    from copy import deepcopy
    from zoneinfo import ZoneInfo

    timed = offer()
    timed.raw_payload = {
        "origin_airport": "WRO", "destination_airport": "BCN", "airline": "FR",
        "transfers": 0, "return_transfers": 0,
        "return_origin_airport": "BCN", "return_destination_airport": "WRO",
        "departure_at": "2026-10-17T10:00:00+02:00", "duration_to": 120,
        "return_at": "2026-10-24T22:00:00+02:00", "duration_back": 160,
        "link": "/search/unchanged?marker=fixture",
    }
    before = deepcopy(timed.raw_payload)
    facts = flight_facts(timed)
    assert facts.return_arrival == datetime(2026, 10, 24, 22, 40, tzinfo=UTC)
    assert facts.origin_timezone == "Europe/Warsaw"
    assert facts.destination_timezone == "Europe/Madrid"
    assert facts.return_arrival.astimezone(ZoneInfo(facts.return_destination_timezone)).isoformat() == "2026-10-25T00:40:00+02:00"
    assert facts.return_arrival_calculated and facts.outbound_arrival_calculated
    assert facts.airline_name == "Ryanair"
    assert timed.raw_payload == before


def test_reference_unknowns_do_not_guess_a_city_timezone_or_airline():
    assert airport_timezone("WRO") == "Europe/Warsaw"
    assert airport_timezone("LHR") == "Europe/London"
    assert airport_timezone("JFK") == "America/New_York"
    assert airport_timezone("XXX") is None
    assert airport_timezone(None) is None
    assert airline_name("FR") == "Ryanair"
    assert airline_name("??") is None
    facts = flight_facts(offer(destination="LON", departure_at="2026-10-17"))
    assert facts.destination_timezone is None
    assert not facts.outbound_arrival_calculated


def test_each_airport_and_timezone_is_independent_and_missing_data_is_not_reversed():
    facts = flight_facts(offer(origin_airport="WRO", destination_airport="STN",
        return_origin_airport="LTN", return_destination_airport="KRK"))
    assert (facts.origin_airport, facts.destination_airport) == ("WRO", "STN")
    assert (facts.return_origin_airport, facts.return_destination_airport) == ("LTN", "KRK")
    assert facts.return_origin_timezone == "Europe/London"
    assert facts.return_destination_timezone == "Europe/Warsaw"
    missing = flight_facts(offer(origin_airport="WRO", destination_airport="STN", destination="LON"))
    assert missing.return_origin_airport is None and missing.return_destination_airport is None
    assert missing.return_origin_timezone is None and missing.return_destination_timezone is None
    one_way = flight_facts(offer(return_at=None, return_origin_airport="LTN", return_destination_airport="WRO"))
    assert one_way.return_origin_airport is None and one_way.return_destination_airport is None


@pytest.mark.parametrize("bad", [None, True, "", "lon", "LONDON", "<x>", 123, {}])
def test_invalid_return_airports_stay_unknown(bad):
    facts = flight_facts(offer(return_origin_airport=bad, return_destination_airport=bad))
    assert facts.return_origin_airport is None and facts.return_destination_airport is None
    assert facts.return_origin_timezone is None and facts.return_destination_timezone is None


def test_open_jaw_route_survives_normalization_storage_and_public_api(api_client, isolated_db):
    from datetime import timedelta

    from app.models.location import Destination
    from app.providers.base import SearchQuery
    from app.providers.travelpayouts import TravelpayoutsDataProvider
    from app.services.currency import PlnOnlyConverter
    from app.services.deals import generate_flight_deal
    from app.services.ingestion import ingest_offers
    from sqlalchemy import select

    base, _ = catalog_fixture(isolated_db)
    destination = isolated_db.get(Destination, base.destination_id)
    destination.iata_code = "LON"
    destination.slug, destination.city, destination.country_code = "london", "London", "GB"
    provider = DataProvider(code="travelpayouts_data", name="Fixture")
    isolated_db.add(provider)
    isolated_db.commit()
    departure = datetime.now(UTC) + timedelta(days=30)
    payload = {"origin":"WRO", "destination":"LON", "origin_airport":"WRO",
        "destination_airport":"STN", "return_origin_airport":"LTN", "return_destination_airport":"WRO",
        "price":250, "currency":"PLN", "departure_at":departure.isoformat(),
        "return_at":(departure + timedelta(days=3)).isoformat(), "duration_to":120, "duration_back":130,
        "transfers":0, "return_transfers":1}
    normalized = TravelpayoutsDataProvider(token="fixture")._normalize(payload, SearchQuery(origin="WRO"))
    result = ingest_offers(isolated_db, provider_code=provider.code, offers=[normalized], converter=PlnOnlyConverter())
    assert result.saved_offers == 1
    stored = isolated_db.scalar(select(TravelOffer).where(TravelOffer.data_provider_id == provider.id))
    assert stored.raw_payload == payload
    assert stored.raw_payload["destination_airport"] == "STN"
    assert stored.raw_payload["return_origin_airport"] == "LTN"
    deal = generate_flight_deal(isolated_db, stored)
    response = api_client.get("/api/v1/deals/" + deal.slug)
    assert response.status_code == 200
    facts = response.json()["flight_facts"]
    assert (facts["origin_airport"], facts["destination_airport"]) == ("WRO", "STN")
    assert (facts["return_origin_airport"], facts["return_destination_airport"]) == ("LTN", "WRO")
    assert facts["outbound_stops"] == 0 and facts["return_stops"] == 1
    listing = api_client.get("/api/v1/deals").json()
    assert next(d for d in listing if d["slug"] == deal.slug)["flight_facts"] == facts
