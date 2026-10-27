from datetime import UTC, datetime, time, timedelta

import pytest
from app.api import events as route
from app.config import get_settings
from app.models.event import EventWindow
from app.schemas.event import EventResults
from app.services.event_sync import save_window
from tests.helpers import catalog_fixture
from tests.test_event_grouping import event, pair


def setup_search(db, monkeypatch):
    monkeypatch.setattr(get_settings(), 'events_enabled', True)
    deal, _ = catalog_fixture(db)
    params = {'date_mode': 'stay', 'start_date': str(deal.trip_start),
              'end_date': str(deal.trip_end)}
    return deal, f'/api/v1/deals/{deal.slug}/events', params


def test_pages_follow_grouping_without_losing_options_or_distinct_sessions(api_client, isolated_db, monkeypatch):
    deal, path, params = setup_search(isolated_db, monkeypatch)
    items = [event(f'early-{i}', f'Early {i:02}', local_time=time(10)) for i in range(11)]
    items += pair() + [event('late', 'Duke Dumont', local_time=time(21, 30))]
    items = [item.model_copy(update={'start_date': deal.trip_start}) for item in items]
    raw = EventResults(status='READY', events=items)
    monkeypatch.setattr(route.event_service, 'search', lambda *args: raw.model_copy(deep=True))
    first = api_client.get(path, params=params).json()
    second = api_client.get(path, params=params | {'page': 2}).json()
    assert first['total'] == second['total'] == 13
    assert first['page'] == 1 and first['page_size'] == 12 and first['has_more']
    assert not first['partial']  # Pagination does not mean incomplete provider coverage.
    assert second['page'] == 2 and not second['has_more']
    assert len(first['events']) == 12 and [e['id'] for e in second['events']] == ['late']
    assert not ({e['id'] for e in first['events']} & set(second['flight_fit']))
    grouped = first['events'][-1]
    assert grouped['id'] == 'standard' and len(grouped['ticket_options']) == 2
    assert set(first['flight_fit']) == {e['id'] for e in first['events']}
    assert set(second['flight_fit']) == {'late'}
    beyond = api_client.get(path, params=params | {'page': 3}).json()
    assert beyond['status'] == 'EMPTY' and beyond['total'] == 13 and not beyond['has_more']


def test_selected_day_reads_catalogue_directly_even_after_a_thousand_first_day_offers(api_client, isolated_db, monkeypatch):
    deal, path, params = setup_search(isolated_db, monkeypatch)
    later = deal.trip_start + timedelta(days=1)
    items = [event(f'first-{i}', f'First {i}', start_date=deal.trip_start) for i in range(1001)]
    items += [event('next-day', 'Next day', start_date=later)]
    # A multi-day listing still belongs in a selected day that it overlaps.
    items += [event('festival', 'Festival', start_date=deal.trip_start, end_date=later)]
    now = datetime.now(UTC)
    save_window(isolated_db, deal.destination_id, deal.trip_start, deal.trip_end, items, now)
    isolated_db.add(EventWindow(destination_id=deal.destination_id, start_date=deal.trip_start,
        end_date=deal.trip_end, status='SUCCEEDED', checked_at=now, attempted_at=now))
    isolated_db.commit()
    first = api_client.get(path, params=params).json()
    assert first['partial'] and first['has_more']
    selected = api_client.get(path, params=params | {'event_date': str(later)}).json()
    assert selected['event_date'] == str(later) and selected['total'] == 2
    assert {e['id'] for e in selected['events']} == {'next-day', 'festival'}
    assert not selected['partial'] and not selected['has_more']
    assert selected['start_date'] == params['start_date'] and selected['end_date'] == params['end_date']
    empty = api_client.get(path, params=params | {'event_date': str(deal.trip_end)}).json()
    assert empty['status'] == 'EMPTY' and empty['total'] == 0
    assert not empty['partial']


@pytest.mark.parametrize('extra', [{'page': 0}, {'page': -1}, {'page': 85}, {'page': 'bad'},
                                  {'event_date': 'bad'}])
def test_invalid_browsing_parameters_rejected(api_client, isolated_db, monkeypatch, extra):
    _, path, params = setup_search(isolated_db, monkeypatch)
    assert api_client.get(path, params=params | extra).status_code == 422


def test_selected_day_cannot_expand_the_search_or_bypass_flight_dates(api_client, isolated_db, monkeypatch):
    deal, path, params = setup_search(isolated_db, monkeypatch)
    for day in [deal.trip_start - timedelta(days=1), deal.trip_end + timedelta(days=1)]:
        assert api_client.get(path, params=params | {'event_date': str(day)}).status_code == 422
    before = deal.trip_start - timedelta(days=1)
    assert api_client.get(path, params=params | {'date_mode': 'flight',
        'start_date': str(before), 'event_date': str(deal.trip_start)}).status_code == 422
