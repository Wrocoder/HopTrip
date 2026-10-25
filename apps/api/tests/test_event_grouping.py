from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal

import pytest
from app.schemas.deal import FlightFacts
from app.schemas.event import EventRead, EventResults
from app.services.event_flight_fit import combined_flight_fit
from app.services.event_grouping import group_events

DAY = date(2030, 11, 21)


def event(key='standard', name='Duke Dumont', **changes):
    return EventRead(**(dict(id=key, name=name, venue='OVO Arena Wembley', venue_id='wembley',
        city='London', start_date=DAY, local_time=time(18), timezone='Europe/London',
        status='onsale', category='MUSIC', price_from=Decimal(40), currency='GBP',
        url=f'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2F{key}') | changes))


def pair(**premium_changes):
    return [event(), event('premium', 'Duke Dumont - Venue Premium Tickets', **premium_changes)]


def test_duke_standard_and_premium_are_one_card_with_independent_prices_links_and_stable_id():
    items = pair(price_from=Decimal(100), currency='EUR')
    original = [item.model_dump() for item in items]
    grouped = group_events(items)
    assert len(grouped) == 1 and grouped[0].name == 'Duke Dumont'
    assert grouped[0].id == 'standard' and grouped[0].url == items[0].url
    assert [option.ticket_kind for option in grouped[0].ticket_options] == ['STANDARD', 'PREMIUM']
    assert [option.currency for option in grouped[0].ticket_options] == ['GBP', 'EUR']
    assert [option.price_from for option in grouped[0].ticket_options] == [Decimal(40), Decimal(100)]
    assert grouped[0].ticket_options[1].url == items[1].url
    assert group_events(list(reversed(items))) == grouped
    assert [item.model_dump() for item in items] == original


def test_robert_glasper_sessions_remain_separate_and_are_ordered_by_start_time():
    items = [event('late','Robert Glasper',local_time=time(21,30)),
             event('early','Robert Glasper',local_time=time(19))]
    assert [item.id for item in group_events(items)] == ['early','late']
    assert all(not item.ticket_options for item in group_events(items))


def test_sorting_accepts_mixed_offset_clocks_and_unknown_times_without_dropping_cards():
    items = [event('unknown', local_time=None), event('offset', local_time=time(19, tzinfo=UTC)),
             event('plain', local_time=time(18))]
    assert [item.id for item in group_events(items)] == ['plain', 'offset', 'unknown']


@pytest.mark.parametrize('changes', [
    {'local_time':time(19)}, {'start_date':DAY+timedelta(days=1)},
    {'venue_id':'other'}, {'venue':'Another room'}, {'city':'Manchester'},
    {'timezone':'Europe/Paris'}, {'category':'SPORTS'}, {'status':'rescheduled'},
    {'end_date':DAY+timedelta(days=1)}, {'venue_id':None},
])
def test_different_session_facts_are_not_merged(changes):
    assert len(group_events(pair(**changes))) == 2


@pytest.mark.parametrize('changes', [{'local_time':None}, {'venue_id':None},
                                   {'timezone':'Unknown/Zone'}, {'venue':''}])
def test_missing_or_invalid_session_facts_do_not_prove_a_match(changes):
    assert len(group_events([item.model_copy(update=changes) for item in pair()])) == 2


@pytest.mark.parametrize('name', ['Duke Dumont - VIP Experience','Duke Dumont - Parking',
                                'Duke Dumont with special guest','Duke Dumont Premium Club'])
def test_non_matching_titles_and_addons_are_not_rewritten(name):
    assert len(group_events([event(),event('other',name)])) == 2


def test_dst_repeated_clock_never_combines_different_instants_or_ambiguous_starts():
    items = [item.model_copy(update={'start_date':date(2030,10,27),'local_time':time(1,30)}) for item in pair()]
    assert len(group_events(items)) == 2
    items[0].start_at = datetime(2030,10,27,0,30,tzinfo=UTC)
    items[1].start_at = datetime(2030,10,27,1,30,tzinfo=UTC)
    assert len(group_events(items)) == 2


def test_group_preserves_a_conflict_in_one_option_and_does_not_borrow_its_known_duration():
    items = pair(end_at=datetime(2030,11,21,23,tzinfo=UTC))
    facts = FlightFacts(outbound_arrival=datetime(2030,11,21,10,tzinfo=UTC),
        return_departure=datetime(2030,11,21,22,tzinfo=UTC),
        destination_airport='STN',return_origin_airport='LTN')
    result = combined_flight_fit(group_events(items)[0],facts,DAY,DAY)
    assert result.status == 'CONFLICT' and 'ENDS_AFTER_RETURN' in result.reasons
    assert result.duration_minutes is None and 'UNKNOWN_DURATION' in result.reasons
    assert result.return_gap_minutes is None


def test_grouping_precedes_the_twelve_card_limit_and_keeps_complete_options(api_client, isolated_db, monkeypatch):
    from app.api import events as route
    from app.config import get_settings
    from tests.helpers import catalog_fixture

    monkeypatch.setattr(get_settings(),'events_enabled',True)
    deal, _ = catalog_fixture(isolated_db)
    # Thirteen offers become twelve distinct sessions; neither variant is dropped.
    items = pair() + [event(f'other-{i}',f'Other event {i}') for i in range(11)]
    items = [item.model_copy(update={'start_date':deal.trip_start}) for item in items]
    raw = EventResults(status='READY',events=items)
    monkeypatch.setattr(route.event_service,'search',lambda *args: raw.model_copy(deep=True))
    response = api_client.get(f'/api/v1/deals/{deal.slug}/events',params={
        'date_mode':'other','start_date':str(deal.trip_start),'end_date':str(deal.trip_end)})
    assert response.status_code == 200
    data = response.json()
    assert len(data['events']) == 12 and not data['partial']
    grouped = next(item for item in data['events'] if item['id']=='standard')
    assert len(grouped['ticket_options']) == 2
    assert 'standard' in data['flight_fit'] and raw.events[0].ticket_options == []
