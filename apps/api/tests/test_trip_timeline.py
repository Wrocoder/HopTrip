from datetime import date, datetime

import pytest
from app.schemas.deal import FlightFacts
from app.services.flight_facts import flight_facts
from app.services.trip_timeline import elapsed, trip_timeline
from test_flight_facts import offer
from test_return_routes import evidence, route_fixture


def facts(**changes):
    values = dict(
        origin_timezone="Europe/Warsaw", destination_timezone="Europe/Madrid",
        return_origin_timezone="Europe/Madrid", return_destination_timezone="Europe/Warsaw",
        outbound_departure="2030-05-03T23:30:00+02:00",
        outbound_arrival="2030-05-04T01:30:00+02:00",
        return_departure="2030-05-05T23:30:00+02:00",
        return_arrival="2030-05-06T01:30:00+02:00",
    )
    return FlightFacts(**(values | changes))


def test_overnight_outbound_and_monday_arrival_are_separate_from_nights():
    result = trip_timeline(facts())
    assert result.local_outbound_departure_date == date(2030, 5, 3)
    assert result.local_destination_arrival_date == date(2030, 5, 4)
    assert result.local_return_departure_date == date(2030, 5, 5)
    assert result.local_return_arrival_date == date(2030, 5, 6)
    assert result.nights_at_destination == 1
    assert result.return_arrival_day_offset == 1
    assert result.outbound_elapsed_minutes == result.return_elapsed_minutes == 120
    assert result.journey_elapsed_minutes == 3000


@pytest.mark.parametrize("start,end,minutes", [
    ("2030-03-31T01:30:00+01:00", "2030-03-31T03:30:00+02:00", 60),
    ("2030-10-27T02:30:00+02:00", "2030-10-27T02:30:00+01:00", 60),
])
def test_dst_uses_elapsed_utc_not_wall_clock(start, end, minutes):
    assert elapsed(datetime.fromisoformat(start), datetime.fromisoformat(end)) == minutes
    result = trip_timeline(facts(outbound_arrival=start, return_departure=end))
    assert result.nights_at_destination == 0


@pytest.mark.parametrize("zone", [None, "Unknown/Zone", ""])
def test_unknown_zone_never_becomes_a_utc_calendar_guess(zone):
    result = trip_timeline(facts(destination_timezone=zone, return_destination_timezone=zone))
    assert result.nights_at_destination is None
    assert result.local_destination_arrival_date is None
    assert result.local_return_arrival_date is None
    assert result.return_arrival_day_offset is None
    assert result.return_elapsed_minutes == 120


@pytest.mark.parametrize("patch", [
    {"outbound_arrival": None}, {"return_departure": None},
    {"outbound_arrival": "2030-05-06T00:00:00Z"},
    {"outbound_arrival": "2030-05-04T01:30:00"},
    {"return_origin_timezone": "Europe/London"},
])
def test_incomplete_reversed_or_different_calendar_stay_is_unknown(patch):
    assert trip_timeline(facts(**patch)).nights_at_destination is None


def test_one_way_and_estimation_flags():
    result = trip_timeline(facts(return_departure=None, return_arrival=None))
    assert result.nights_at_destination is None and result.journey_elapsed_minutes is None
    assert result.return_arrival_day_offset is None
    calculated = trip_timeline(facts(outbound_arrival_calculated=True, return_arrival_calculated=True))
    assert calculated.nights_estimated and calculated.return_arrival_estimated


def test_actual_return_airport_zone_and_date_line_shift():
    result = trip_timeline(facts(return_origin_timezone="Asia/Tokyo",
        return_destination_timezone="America/Los_Angeles",
        return_departure="2030-05-05T00:30:00+09:00", return_arrival="2030-05-04T18:30:00-07:00"))
    assert result.local_return_arrival_date == date(2030, 5, 4)
    assert result.return_arrival_day_offset == -1
    assert result.return_elapsed_minutes == 600


def test_real_validated_segments_publish_timeline_without_changing_advertised_dates(isolated_db):
    stored, row = route_fixture(isolated_db)
    stored.route_details = evidence(row)
    result = flight_facts(stored)
    assert result.timeline.local_return_arrival_date == date(2030, 11, 5)
    assert result.timeline.local_return_departure_date == date(2030, 11, 4)
    assert result.timeline.nights_at_destination == 3
    assert not result.timeline.return_arrival_estimated
    assert result.return_origin_airport == "LTN"  # Different airport from outbound STN.


def test_direct_duration_is_explicitly_estimated_in_public_json():
    stored = offer(origin_airport="WRO", destination_airport="BCN", transfers=0,
        return_transfers=0, return_origin_airport="BCN", return_destination_airport="KRK",
        departure_at="2030-05-03T23:30:00+02:00", duration_to=120, duration_back=120)
    stored.raw_payload["return_at"] = "2030-05-05T23:30:00+02:00"
    result = flight_facts(stored).model_dump(mode="json")["timeline"]
    assert result["version"] == "trip-timeline-v1"
    assert result["local_return_arrival_date"] == "2030-05-06"
    assert result["nights_at_destination"] == 1
    assert result["nights_estimated"] and result["return_arrival_estimated"]
