from datetime import UTC, date, datetime, time, timedelta

import pytest
from app.schemas.deal import FlightFacts
from app.schemas.event import EventRead, EventResults
from app.services.event_flight_fit import event_flight_fit

FIRST, LAST = date(2026, 10, 24), date(2026, 10, 26)


def stamp(value):
    return datetime.fromisoformat(value)


def facts(**overrides):
    return FlightFacts(**(dict(outbound_arrival=stamp('2026-10-24T10:00:00+01:00'),
        return_departure=stamp('2026-10-26T10:00:00Z'), destination_airport='STN',
        return_origin_airport='LTN', outbound_arrival_calculated=True) | overrides))


def event(**overrides):
    return EventRead(**(dict(id='fit', name='Concert', start_date=FIRST, end_date=None,
        local_time=time(21, 30), timezone='Europe/London', status='onsale', category='MUSIC',
        venue='Venue', city='London', url='https://ticketmaster.evyy.net/c/7853869/123/456') | overrides))


def fit(item=None, flight=None, first=FIRST, last=LAST):
    return event_flight_fit(item or event(), flight or facts(), first, last)


@pytest.mark.parametrize('day,offset', [('2026-10-24','+01:00'),('2026-10-25','+00:00')])
def test_stansted_2020_to_concert_2130_warns_70_minutes_across_dst(day, offset):
    flight = facts(outbound_arrival=stamp(day+'T20:20:00'+offset))
    result = fit(event(start_date=date.fromisoformat(day)), flight)
    assert result.status == 'TIGHT'
    assert result.arrival_gap_minutes == 70 and result.buffer_minutes == 180
    assert result.arrival_airport == 'STN' and result.return_airport == 'LTN'
    assert 'ARRIVAL_BUFFER' in result.reasons and 'UNKNOWN_DURATION' in result.reasons
    assert result.duration_minutes is None and result.arrival_estimated


@pytest.mark.parametrize('item,flight,reason', [
    (event(local_time=time(19)), facts(outbound_arrival=stamp('2026-10-24T20:20:00+01:00')), 'BEFORE_ARRIVAL'),
    (event(start_date=date(2026,10,27)), facts(), 'AFTER_RETURN'),
    (event(start_date=LAST,local_time=time(10)), facts(), 'AFTER_RETURN'),
    (event(start_date=LAST,local_time=time(8),end_at=stamp('2026-10-26T10:00:00Z')), facts(), 'ENDS_AFTER_RETURN'),
    (event(end_date=date(2026,10,27)), facts(), 'ENDS_AFTER_RETURN'),
    (event(start_date=date(2026,10,23),local_time=None), facts(), 'BEFORE_ARRIVAL'),
])
def test_events_outside_flight_window_are_conflicts(item, flight, reason):
    result = fit(item, flight)
    assert result.status == 'CONFLICT' and reason in result.reasons


def test_known_end_near_return_and_unknown_end_are_distinct():
    flight = facts(return_departure=stamp('2026-10-24T23:30:00Z'))
    result = fit(event(local_time=time(19),end_at=stamp('2026-10-24T22:00:00Z')), flight)
    assert result.status == 'TIGHT' and result.return_gap_minutes == 90
    assert result.duration_minutes == 240
    assert 'RETURN_BUFFER' in result.reasons and 'UNKNOWN_DURATION' not in result.reasons
    unknown = fit(event(local_time=time(23)), flight)
    assert unknown.status == 'TIGHT' and unknown.return_gap_minutes is None
    assert unknown.return_start_gap_minutes == 90  # 23:00 BST is 22:00 UTC.
    assert 'UNKNOWN_DURATION' in unknown.reasons


def test_unknown_clocks_duration_airports_and_one_way_never_claim_compatibility():
    assert fit().status == 'CHECK' and 'UNKNOWN_DURATION' in fit().reasons
    missing_time = fit(event(local_time=None))
    assert 'UNKNOWN_EVENT_TIME' in missing_time.reasons and 'UNKNOWN_DURATION' in missing_time.reasons
    missing_flights = fit(flight=facts(outbound_arrival=None, return_departure=None))
    assert 'UNKNOWN_ARRIVAL' in missing_flights.reasons and 'UNKNOWN_RETURN' in missing_flights.reasons
    missing_airports = fit(flight=facts(destination_airport=None, return_origin_airport=None))
    assert missing_airports.status == 'CHECK' and 'UNKNOWN_AIRPORT' in missing_airports.reasons
    one_way = fit(last=None)
    assert one_way.status == 'CHECK' and 'ONE_WAY' in one_way.reasons
    assert one_way.return_gap_minutes is None and one_way.return_start_gap_minutes is None
    assert one_way.return_airport is None
    unknown_zone = fit(event(timezone='Unknown/Zone'))
    assert unknown_zone.status == 'CHECK' and 'UNKNOWN_TIMEZONE' in unknown_zone.reasons


@pytest.mark.parametrize('item', [event(start_date=FIRST-timedelta(days=1)),
    event(start_date=LAST+timedelta(days=1)),event(end_date=LAST+timedelta(days=1))])
def test_calendar_mismatch_without_flight_clocks_needs_checking_not_definite_conflict(item):
    result = fit(item, facts(outbound_arrival=None, return_departure=None))
    assert result.status == 'CHECK' and 'OUTSIDE_FLIGHT_DATES' in result.reasons
    assert 'UNKNOWN_ARRIVAL' in result.reasons and 'UNKNOWN_RETURN' in result.reasons


def test_known_end_can_conflict_even_when_start_time_and_duration_are_unknown():
    after_return = fit(event(start_date=LAST,local_time=None,end_at=stamp('2026-10-26T11:00:00Z')))
    assert after_return.status == 'CONFLICT' and 'ENDS_AFTER_RETURN' in after_return.reasons
    assert 'UNKNOWN_EVENT_TIME' in after_return.reasons and after_return.duration_minutes is None
    before_arrival = fit(event(local_time=None,end_at=stamp('2026-10-24T08:00:00Z')))
    assert before_arrival.status == 'CONFLICT' and 'BEFORE_ARRIVAL' in before_arrival.reasons


def test_exact_end_and_complete_clocks_only_allow_no_detected_conflict():
    result = fit(event(end_at=stamp('2026-10-24T22:30:00Z')))
    assert result.status == 'NO_KNOWN_CONFLICT' and result.reasons == []
    assert result.duration_minutes == 120
    assert result.arrival_gap_minutes == 690


@pytest.mark.parametrize('minutes,expected', [(179,'TIGHT'),(180,'NO_KNOWN_CONFLICT')])
def test_threshold_is_elapsed_time_not_wall_clock(minutes, expected):
    item = event(local_time=time(13),end_at=stamp('2026-10-24T14:00:00Z'))
    result = fit(item, facts(outbound_arrival=stamp('2026-10-24T12:00:00Z')-timedelta(minutes=minutes)))
    assert result.arrival_gap_minutes == minutes and result.status == expected


def test_dst_repeated_time_is_not_assigned_a_convenient_fold_and_exact_instant_resolves_it():
    item = event(start_date=date(2026,10,25),local_time=time(1,30))
    flight = facts(outbound_arrival=stamp('2026-10-25T00:50:00Z'))
    result = fit(item, flight)
    assert result.status == 'TIGHT' and 'AMBIGUOUS_EVENT_TIME' in result.reasons
    assert result.arrival_gap_minutes == -20  # One fold is already before arrival.
    exact = fit(item.model_copy(update={'start_at':stamp('2026-10-25T01:30:00Z')}), flight)
    assert exact.arrival_gap_minutes == 40 and 'AMBIGUOUS_EVENT_TIME' not in exact.reasons


def test_dst_nonexistent_time_or_conflicting_timestamp_is_unknown():
    spring = fit(event(start_date=date(2026,3,29),local_time=time(1,30)),
        facts(outbound_arrival=stamp('2026-03-28T12:00:00Z'),return_departure=stamp('2026-03-30T12:00:00Z')),
        first=date(2026,3,28),last=date(2026,3,30))
    assert spring.status == 'CHECK' and 'INVALID_EVENT_TIME' in spring.reasons
    bad = fit(event(start_at=stamp('2026-10-24T10:00:00Z')))
    assert bad.status == 'CHECK' and 'INVALID_EVENT_TIME' in bad.reasons


def test_api_annotates_stay_search_without_persisting_fit_in_catalogue(api_client, isolated_db, monkeypatch):
    from app.api import events as routes
    from app.config import get_settings
    from app.services.catalog import serialize_deal
    from tests.helpers import catalog_fixture

    monkeypatch.setattr(get_settings(), 'events_enabled', True)
    deal, _ = catalog_fixture(isolated_db)
    context = serialize_deal(isolated_db, deal)
    context.trip_type = 'ROUND_TRIP'
    # Use fixture dates so the available-deal gate stays real and future-proof.
    day = deal.trip_start
    context.flight_facts = facts(outbound_arrival=datetime.combine(day,time(20,20),UTC),
        return_departure=datetime.combine(deal.trip_end,time(10),UTC))
    monkeypatch.setattr(routes, 'serialize_deal', lambda *args: context)
    item = event(start_date=day, local_time=time(21,30), timezone='UTC')
    outside = event(id='outside',start_date=deal.trip_end+timedelta(days=1),local_time=None)
    raw = EventResults(status='READY',events=[item,outside])
    monkeypatch.setattr(routes.event_service,'search',lambda *args: raw.model_copy(deep=True))
    response = api_client.get(f'/api/v1/deals/{deal.slug}/events', params={
        'date_mode':'stay','start_date':str(day),'end_date':str(deal.trip_end+timedelta(days=1))})
    assert response.status_code == 200
    result = response.json()['flight_fit']
    assert result['fit']['status'] == 'TIGHT' and result['fit']['arrival_gap_minutes'] == 70
    assert result['outside']['status'] == 'CONFLICT'
    assert raw.flight_fit == {}  # The shared result/source is not modified with one trip's assessment.
