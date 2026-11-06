from datetime import datetime

import pytest
from app.schemas.destination_time import DestinationTime
from app.services.destination_time import destination_time
from app.services.trip_timeline import trip_timeline
from pydantic import ValidationError
from test_trip_timeline import facts


def window(**changes):
    return facts(**(dict(destination_airport="BCN", return_origin_airport="BCN",
        return_departure="2030-05-04T21:30:00+02:00") | changes))


def test_twenty_hour_airport_window_is_not_city_time_nights_or_transit():
    value = window()
    result = destination_time(value, itinerary_eligible=True)
    assert result.airport_interval_minutes == 1200 and result.status == "KNOWN"
    assert result.sort_eligible and not result.airport_change
    assert result.usable_city_minutes is None and result.city_time_status == "UNKNOWN"
    assert result.buffers_applied is False
    timeline = trip_timeline(value)
    assert timeline.nights_at_destination == 0
    assert timeline.journey_elapsed_minutes != result.airport_interval_minutes


@pytest.mark.parametrize("start,end,minutes", [
    ("2030-03-31T01:30:00+01:00", "2030-03-31T03:30:00+02:00", 60),
    ("2030-10-27T02:30:00+02:00", "2030-10-27T02:30:00+01:00", 60),
    ("2030-05-04T01:30:00+02:00", "2030-05-04T01:30:00+02:00", 0),
    ("2030-05-04T01:30:00+02:00", "2030-05-04T01:30:59+02:00", 0),
])
def test_dst_and_same_day_use_utc_elapsed_minutes(start, end, minutes):
    result = destination_time(window(outbound_departure="2030-01-01T00:00:00Z",
        outbound_arrival=start, return_departure=end), itinerary_eligible=True)
    assert result.airport_interval_minutes == minutes and result.sort_eligible


@pytest.mark.parametrize("patch,reason", [
    ({"outbound_arrival": None}, "MISSING_OR_INVALID_TIMES"),
    ({"return_departure": None}, "MISSING_OR_INVALID_TIMES"),
    ({"outbound_departure": None}, "MISSING_OR_INVALID_TIMES"),
    ({"outbound_arrival": "2030-05-04T01:30:00"}, "MISSING_OR_INVALID_TIMES"),
    ({"return_departure": "2030-05-03T23:40:00+02:00"}, "MISSING_OR_INVALID_TIMES"),
    ({"outbound_departure": "2030-05-04T06:00:00+02:00"}, "MISSING_OR_INVALID_TIMES"),
    ({"destination_timezone": None}, "UNKNOWN_TIMEZONE"),
    ({"return_origin_timezone": "Unknown/Zone"}, "UNKNOWN_TIMEZONE"),
    ({"destination_airport": None}, "MISSING_AIRPORTS"),
    ({"return_origin_airport": "invalid"}, "MISSING_AIRPORTS"),
])
def test_missing_naive_reversed_or_unknown_endpoints_cannot_rank_as_known(patch, reason):
    result = destination_time(window(**patch), itinerary_eligible=True)
    assert result.status == "UNKNOWN" and not result.sort_eligible
    assert result.airport_interval_minutes is None and result.reason == reason
    assert result.usable_city_minutes is None


def test_estimated_arrival_never_becomes_reliable_sort_but_home_estimate_is_independent():
    result = destination_time(window(outbound_arrival_calculated=True), itinerary_eligible=True)
    assert result.airport_interval_minutes == 1200 and result.status == "ESTIMATED"
    assert not result.sort_eligible
    home = destination_time(window(return_arrival_calculated=True, return_arrival=None), itinerary_eligible=True)
    assert home.airport_interval_minutes == 1200 and home.sort_eligible


def test_bad_source_context_wins_over_plausible_timestamps():
    result = destination_time(window(), itinerary_eligible=False)
    assert not result.sort_eligible and result.airport_interval_minutes is None
    assert result.reason == "UNVERIFIED_ITINERARY"


def test_airport_switch_exposes_endpoints_without_inventing_transfer_or_city_time():
    result = destination_time(window(return_origin_airport="GRO"), itinerary_eligible=True)
    assert result.airport_change and result.arrival_airport == "BCN" and result.departure_airport == "GRO"
    assert result.airport_interval_minutes == 1200 and result.usable_city_minutes is None
    assert not result.buffers_applied


@pytest.mark.parametrize("patch", [{"usable_city_minutes": 0}, {"city_time_status": "KNOWN"},
                                  {"buffers_applied": True}, {"airport_interval_minutes": -1}])
def test_v1_cannot_claim_unsupported_city_minutes_or_buffers(patch):
    with pytest.raises(ValidationError):
        DestinationTime(**patch)


def test_real_connected_segments_use_final_arrival_not_initial_departure_or_home(isolated_db, api_client):
    from copy import deepcopy
    from datetime import UTC, timedelta

    from app.services.deals import generate_flight_deal
    from app.services.flight_facts import flight_facts
    from test_return_routes import evidence, route_fixture

    offer, row = route_fixture(isolated_db)
    # Synthetic overnight outbound connection, exact cached ticket evidence.
    row = deepcopy(row)
    row['segments'][0]['arrival_at'] = '2030-11-02T16:00:00Z'
    row['segments'][0]['flight_legs'] = [
        dict(origin='WRO', destination='FRA', departure_at='2030-11-01T13:00:00+01:00', arrival_at='2030-11-01T14:00:00Z'),
        dict(origin='FRA', destination='STN', departure_at='2030-11-02T14:00:00Z', arrival_at='2030-11-02T16:00:00Z'),
    ]
    offer.raw_payload = {**offer.raw_payload, 'transfers': 1, 'duration_to': 240}
    offer.route_details = evidence(row)
    now = datetime.now(UTC)
    offer.last_verified_at = offer.fetched_at = now
    offer.expires_at = now + timedelta(hours=24)
    isolated_db.flush()
    deal = generate_flight_deal(isolated_db, offer, now)
    isolated_db.commit()
    response = api_client.get(f'/api/v1/deals/{deal.slug}')
    assert response.status_code == 200
    result = response.json()['destination_time']
    expected = int((datetime.fromisoformat('2030-11-04T22:30:00Z') - datetime.fromisoformat('2030-11-02T16:00:00Z')).total_seconds() // 60)
    assert result['airport_interval_minutes'] == expected and result['status'] == 'KNOWN'
    assert result['arrival_airport'] == 'STN' and result['departure_airport'] == 'LTN'
    assert result['airport_change'] and result['sort_eligible']
    assert result['usable_city_minutes'] is None
    assert result['airport_interval_minutes'] == flight_facts(offer).destination_interval_minutes
    page = api_client.get('/api/v1/deals?include_total=true&limit=1').json()
    assert page['total'] == 1 and page['items'][0]['destination_time'] == result


def test_source_without_flight_metadata_publishes_explicit_unknown(api_client, isolated_db):
    from helpers import catalog_fixture

    deal, _ = catalog_fixture(isolated_db)
    response = api_client.get(f'/api/v1/deals/{deal.slug}')
    assert response.status_code == 200
    result = response.json()['destination_time']
    assert result['version'] == 'destination-time-v1'
    assert result['status'] == 'UNKNOWN' and not result['sort_eligible']
    assert result['airport_interval_minutes'] is None and result['usable_city_minutes'] is None
