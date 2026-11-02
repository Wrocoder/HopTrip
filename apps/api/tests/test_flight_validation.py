"""Synthetic route/date boundary regressions for DATA-03; no live provider calls."""

import asyncio
from datetime import UTC, date, datetime, timedelta

import httpx
import pytest
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.services.flight_facts import flight_facts
from app.services.flight_routes import instant, validated_segments
from app.services.trip_dates import trip_dates
from test_flight_facts import offer
from test_provider_contract import ITEM
from test_return_routes import evidence, route_fixture


@pytest.mark.parametrize("direction", [0, 1])
@pytest.mark.parametrize("broken", ["disconnected", "same_airport", "overlapping"])
def test_broken_connections_are_not_published(isolated_db, direction, broken):
    stored, row = route_fixture(isolated_db)
    segment = row["segments"][direction]
    original = segment["flight_legs"][0]
    # Two synthetic legs with a 30-minute layover and the same total airborne duration.
    start = instant(segment["departure_at"])
    assert start is not None
    first = {**original, "destination": "BER",
             "arrival_at": (start + timedelta(minutes=45)).isoformat()}
    second = {**original, "origin": "BER",
              "departure_at": (start + timedelta(minutes=75)).isoformat()}
    segment["flight_legs"] = [first, second]
    stored.raw_payload = {**stored.raw_payload,
                          "transfers" if direction == 0 else "return_transfers": 1,
                          "duration_to" if direction == 0 else "duration_back": 90}
    if broken == "disconnected":
        second["origin"] = "CDG"
    elif broken == "same_airport":
        first["destination"] = first["origin"]
        second["origin"] = first["origin"]
    else:
        second["departure_at"] = (start + timedelta(minutes=30)).isoformat()
    stored.route_details = evidence(row)
    assert validated_segments(stored, stored.route_details) is None
    facts = flight_facts(stored)
    assert facts.outbound_legs == [] and facts.return_legs == []


@pytest.mark.parametrize("minutes", [-1, 0, 10081])
def test_negative_zero_and_over_limit_segment_durations_are_rejected(isolated_db, minutes):
    stored, row = route_fixture(isolated_db)
    segment = row["segments"][1]
    start = instant(segment["departure_at"])
    assert start is not None
    end = (start + timedelta(minutes=minutes)).isoformat()
    row["return_at"] = segment["arrival_at"] = end
    segment["flight_legs"][0]["arrival_at"] = end
    stored.raw_payload = {**stored.raw_payload, "duration_back": minutes}
    assert validated_segments(stored, evidence(row)) is None


@pytest.mark.parametrize("stamp", [
    "0001-01-01T00:00:00+14:00", "9999-12-31T23:59:00-14:00",
    "2030-02-30T12:00:00Z", "2030-01-01T24:00:00Z", "2030-01-01T12:00:00+01:60",
    "2030-W01-1T12:00:00Z", "2030-01-01", "2030-01-01T12:00:00",
])
def test_invalid_clock_cannot_be_published_or_crash_calculations(stamp):
    facts = flight_facts(offer(departure_at=stamp, transfers=0, duration_to=60))
    assert facts.outbound_departure is None and facts.outbound_arrival is None
    assert instant(stamp) is None


@pytest.mark.parametrize("minutes", [0, -1, True, 1.5, "90", 10081])
def test_invalid_elapsed_duration_never_creates_an_arrival(minutes):
    facts = flight_facts(offer(departure_at="2030-03-30T23:30:00Z",
                               transfers=0, duration_to=minutes))
    assert facts.outbound_departure is not None
    assert facts.outbound_arrival is None


@pytest.mark.parametrize("departure,back,airports", [
    ("2030-03-30T00:30:00+01:00", "2030-03-31T12:00:00+02:00", {}),
    # UTC representation still belongs to the next local calendar day at WRO.
    ("2030-03-29T23:30:00Z", "2030-03-31T10:00:00Z", {"origin_airport": "WRO"}),
    ("2030-03-30", "2030-03-31", {"origin_airport": "WRO"}),
])
def test_duration_filter_uses_departure_calendar_days_not_utc(departure, back, airports):
    item = {**ITEM, **airports, "departure_at": departure, "return_at": back}
    provider = TravelpayoutsDataProvider(token="fixture", transport=httpx.MockTransport(
        lambda request: httpx.Response(200, json={"success": True, "data": [item]})))
    found = asyncio.run(provider.search(SearchQuery(origin="WRO", trip_duration=1)))
    assert len(found) == 1
    assert found[0].payload == item  # Raw evidence and selected-ticket identity stay intact.
    assert asyncio.run(provider.search(SearchQuery(origin="WRO", trip_duration=2))) == []
    assert provider.diagnostics.filtered_items == 1 and provider.rejected_items == 0


@pytest.mark.parametrize("change", [{"destination": "WRO"}, {"destination_airport": "WRO"}])
def test_same_origin_and_destination_is_rejected(change):
    with pytest.raises(ValueError, match="route"):
        TravelpayoutsDataProvider(token="fixture")._normalize(
            {**ITEM, **change}, SearchQuery(origin="WRO"))


@pytest.mark.parametrize("change", [{"origin": "KRK"}, {"destination": "MAD"}])
def test_provider_response_must_match_the_requested_route(change):
    with pytest.raises(ValueError, match="route"):
        TravelpayoutsDataProvider(token="fixture")._normalize(
            {**ITEM, **change}, SearchQuery(origin="WRO", destination="BCN"))


@pytest.mark.parametrize("origin,destination", [("WRO", "LON"), ("WRO", "STN")])
def test_requested_city_or_explicit_airport_can_anchor_the_same_route(origin, destination):
    item = {**ITEM, "destination": "LON", "destination_airport": "STN"}
    raw = TravelpayoutsDataProvider(token="fixture")._normalize(
        item, SearchQuery(origin=origin, destination=destination))
    assert (raw.origin, raw.destination) == ("WRO", "LON")
    assert raw.payload == item


@pytest.mark.parametrize("bad", ["АВС", "wro", "WR0", "WRO ", "<x>", True])
def test_optional_airport_codes_require_ascii_iata_syntax(bad):
    facts = flight_facts(offer(origin_airport=bad, destination_airport=bad,
                               return_origin_airport=bad, return_destination_airport=bad))
    assert facts.origin_airport is None and facts.destination_airport is None
    assert facts.return_origin_airport is None and facts.return_destination_airport is None


@pytest.mark.parametrize("departure,back", [
    ("2026-03-28T23:30:00Z", "2026-03-29T22:30:00Z"),
    ("2026-10-24T22:30:00Z", "2026-10-25T23:30:00Z"),
])
def test_trip_dates_follow_local_departure_dates_across_dst(departure, back):
    stored = offer(departure_at=departure, return_at=datetime.fromisoformat(back),
                   origin_airport="WRO", return_origin_airport="WRO")
    stored.raw_payload["return_at"] = back
    start, end = trip_dates(stored)
    expected = date(2026, 3, 29) if "03-" in departure else date(2026, 10, 25)
    assert start == expected and (end - start).days == 1


def test_date_precision_does_not_turn_utc_midnight_into_a_local_clock():
    stored = offer(departure_precision="DATE", return_at=None,
                   origin_airport="JFK", departure_at="2030-03-30T00:00:00Z")
    stored.depart_at = datetime(2030, 3, 30, tzinfo=UTC)
    assert trip_dates(stored) == (date(2030, 3, 30), None)
    assert flight_facts(stored).outbound_departure is None
