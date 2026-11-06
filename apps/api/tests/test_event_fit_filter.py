from datetime import UTC, datetime, time, timedelta

import pytest
from app.api import events as routes
from app.config import get_settings
from app.schemas.event import EventResults
from app.services.catalog import serialize_deal
from tests.helpers import catalog_fixture
from tests.test_event_flight_fit import facts
from tests.test_event_grouping import event, pair


def search_context(db, monkeypatch):
    monkeypatch.setattr(get_settings(), 'events_enabled', True)
    deal, _ = catalog_fixture(db)
    context = serialize_deal(db, deal)
    day = deal.trip_start
    context.trip_type = 'ROUND_TRIP'
    context.flight_facts = facts(outbound_arrival=datetime.combine(day, time(10), UTC),
        return_departure=datetime.combine(day + timedelta(days=2), time(23), UTC))
    monkeypatch.setattr(routes, 'serialize_deal', lambda *args: context)
    params = {'date_mode': 'stay', 'start_date': str(day),
              'end_date': str(day + timedelta(days=3))}
    return context, day, f'/api/v1/deals/{deal.slug}/events', params


def source(monkeypatch, items, **metadata):
    raw = EventResults(status='READY', events=items, **metadata)
    monkeypatch.setattr(routes.event_service, 'search', lambda *args: raw.model_copy(deep=True))
    return raw


def item(day, key, clock=time(15), **changes):
    return event(key, key, start_date=day, local_time=clock, timezone='UTC', **changes)


def test_only_definite_conflicts_are_removed_unknowns_tight_and_multiday_remain(api_client, isolated_db, monkeypatch):
    _, day, path, params = search_context(isolated_db, monkeypatch)
    raw = source(monkeypatch, [
        item(day, 'before', time(8)),
        item(day + timedelta(days=3), 'after'),
        item(day + timedelta(days=2), 'ends-after', time(22),
             end_at=datetime.combine(day + timedelta(days=3), time(1), UTC)),
        item(day, 'tight', time(11), end_at=datetime.combine(day, time(12), UTC)),
        item(day, 'unknown-time', None), item(day, 'unknown-end'),
        item(day, 'known', end_at=datetime.combine(day, time(17), UTC)),
        item(day + timedelta(days=1), 'multi-day', end_date=day + timedelta(days=2),
             end_at=datetime.combine(day + timedelta(days=2), time(18), UTC)),
        item(day, 'late-night', time(22), end_at=datetime.combine(day + timedelta(days=1), time(1), UTC)),
    ], partial=True, checked_at=datetime.now(UTC))
    original = raw.model_dump()
    default = api_client.get(path, params=params).json()
    assert default == api_client.get(path, params=params | {'fit_mode': 'all'}).json()
    assert default['fit_mode'] == 'all' and default['total'] == 9
    possible = api_client.get(path, params=params | {'fit_mode': 'possible'}).json()
    assert possible['fit_mode'] == 'possible' and possible['total'] == 6
    assert set(possible['flight_fit']) == {row['id'] for row in possible['events']}
    assert set(possible['flight_fit']) == {'tight', 'unknown-time', 'unknown-end', 'known', 'multi-day', 'late-night'}
    assert {fit['status'] for fit in possible['flight_fit'].values()} == {'CHECK', 'TIGHT', 'NO_KNOWN_CONFLICT'}
    assert possible['flight_fit']['late-night']['duration_minutes'] == 180
    assert possible['partial'] and possible['checked_at'] == default['checked_at']
    assert raw.model_dump() == original  # No per-trip filter/fit is persisted to the shared catalogue.


def test_filter_precedes_pagination_and_total_not_only_the_current_page(api_client, isolated_db, monkeypatch):
    _, day, path, params = search_context(isolated_db, monkeypatch)
    source(monkeypatch, [item(day, f'conflict-{i:02}', time(8)) for i in range(13)]
           + [item(day, f'unknown-{i:02}') for i in range(13)])
    all_events = api_client.get(path, params=params).json()
    assert all_events['total'] == 26 and len(all_events['events']) == 12
    first = api_client.get(path, params=params | {'fit_mode': 'possible'}).json()
    second = api_client.get(path, params=params | {'fit_mode': 'possible', 'page': 2}).json()
    assert first['total'] == second['total'] == 13
    assert len(first['events']) == 12 and first['has_more']
    assert [row['id'] for row in second['events']] == ['unknown-12'] and not second['has_more']
    assert not (set(first['flight_fit']) & set(second['flight_fit']))
    beyond = api_client.get(path, params=params | {'fit_mode': 'possible', 'page': 3}).json()
    assert beyond['status'] == 'EMPTY' and beyond['total'] == 13


def test_grouped_ticket_is_filtered_by_the_worst_option_without_losing_all_mode_options(api_client, isolated_db, monkeypatch):
    context, day, path, params = search_context(isolated_db, monkeypatch)
    context.flight_facts.return_departure = datetime.combine(day, time(17), UTC)
    standard, premium = pair()
    rows = [standard.model_copy(update={'start_date': day, 'local_time': time(15), 'timezone': 'UTC',
                                      'end_at': datetime.combine(day, time(16), UTC)}),
            premium.model_copy(update={'start_date': day, 'local_time': time(15), 'timezone': 'UTC',
                                       'end_at': datetime.combine(day, time(18), UTC)})]
    source(monkeypatch, rows)
    all_events = api_client.get(path, params=params).json()
    assert all_events['total'] == 1 and len(all_events['events'][0]['ticket_options']) == 2
    assert all_events['flight_fit']['standard']['status'] == 'CONFLICT'
    filtered = api_client.get(path, params=params | {'fit_mode': 'possible'}).json()
    assert filtered['status'] == 'EMPTY' and filtered['total'] == 0 and not filtered['has_more']
    assert filtered['events'] == [] and filtered['flight_fit'] == {}


@pytest.mark.parametrize('one_way', [False, True])
def test_missing_flight_clocks_and_one_way_do_not_hide_uncertain_events(api_client, isolated_db, monkeypatch, one_way):
    context, day, path, params = search_context(isolated_db, monkeypatch)
    context.trip_type = 'ONE_WAY' if one_way else 'ROUND_TRIP'
    context.flight_facts = facts(outbound_arrival=None, return_departure=None)
    source(monkeypatch, [item(day, 'unknown'), item(day + timedelta(days=3), 'later')])
    result = api_client.get(path, params=params | {'fit_mode': 'possible'}).json()
    assert result['total'] == 2
    assert all(fit['status'] == 'CHECK' for fit in result['flight_fit'].values())
    assert all(('ONE_WAY' if one_way else 'UNKNOWN_RETURN') in fit['reasons']
               for fit in result['flight_fit'].values())


def test_fit_filter_keeps_day_category_and_partial_empty_scope(api_client, isolated_db, monkeypatch):
    _, day, path, params = search_context(isolated_db, monkeypatch)
    calls = []
    raw = EventResults(status='READY', events=[item(day, 'before', time(8))], partial=True)

    def read(*args):
        calls.append(args[2:5])
        return raw.model_copy(deep=True)

    monkeypatch.setattr(routes.event_service, 'search', read)
    result = api_client.get(path, params=params | {'fit_mode': 'possible', 'event_date': str(day), 'category': 'MUSIC'}).json()
    assert calls == [(day, day, 'MUSIC')]
    assert result['status'] == 'EMPTY' and result['partial'] and result['event_date'] == str(day)
    assert result['fit_mode'] == 'possible' and result['total'] == 0


@pytest.mark.parametrize('mode', ['fits', 'unknown', '', 'POSSIBLE'])
def test_invalid_filter_is_rejected_even_when_delivery_is_disabled(api_client, monkeypatch, mode):
    monkeypatch.setattr(get_settings(), 'events_enabled', False)
    assert api_client.get('/api/v1/deals/none/events', params={'fit_mode': mode}).status_code == 422


def test_disabled_response_confirms_requested_mode_without_touching_provider(api_client, monkeypatch):
    monkeypatch.setattr(get_settings(), 'events_enabled', False)
    result = api_client.get('/api/v1/deals/none/events', params={'fit_mode': 'possible'}).json()
    assert result['status'] == 'DISABLED' and result['fit_mode'] == 'possible'
