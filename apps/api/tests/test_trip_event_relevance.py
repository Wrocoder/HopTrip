from datetime import UTC, date, datetime, time, timedelta

import pytest
from app.api import events as routes
from app.config import get_settings
from app.models.event import EventWindow
from app.schemas.event import EventResults
from app.services.event_sync import save_window
from tests.helpers import catalog_fixture
from tests.test_event_grouping import event


@pytest.mark.parametrize(('end_at', 'visible'), [
    (datetime(2099, 5, 4, 11, tzinfo=UTC), False),
    (datetime(2099, 5, 4, 12, tzinfo=UTC), False),
    (datetime(2099, 5, 4, 13, tzinfo=UTC), True),
    (None, True),
    (datetime(2099, 5, 4, 11), True),  # No guessing a timezone for naive end clocks.
    (datetime(2099, 5, 5, 11, tzinfo=UTC), True),  # Contradicts end_date: not evidence.
    (datetime(2099, 5, 2, 11, tzinfo=UTC), True),  # Precedes the event: not evidence.
])
def test_multiday_events_with_a_valid_known_end_are_not_listed_after_ending(
    api_client, isolated_db, monkeypatch, end_at, visible,
):
    class Clock(datetime):
        @classmethod
        def now(cls, tz=None):
            value = datetime(2099, 5, 4, 12, tzinfo=UTC)
            return value.astimezone(tz) if tz else value.replace(tzinfo=None)

    monkeypatch.setattr(routes, 'datetime', Clock)
    monkeypatch.setattr(get_settings(), 'events_enabled', True)
    deal, _ = catalog_fixture(isolated_db)
    item = event('festival', 'Synthetic festival', start_date=date(2099, 5, 3),
        end_date=date(2099, 5, 4), local_time=time(10), timezone='Europe/Madrid',
        start_at=datetime(2099, 5, 3, 8, tzinfo=UTC), end_at=end_at)
    monkeypatch.setattr(routes.event_service, 'search', lambda *args: EventResults(
        status='READY', events=[item],
    ))
    response = api_client.get(f'/api/v1/deals/{deal.slug}/events', params={
        'date_mode': 'stay', 'start_date': '2099-05-04', 'end_date': '2099-05-05',
    })
    assert response.status_code == 200
    data = response.json()
    assert [e['id'] for e in data['events']] == (['festival'] if visible else [])
    assert data['total'] == (1 if visible else 0)
    assert data['status'] == ('READY' if visible else 'EMPTY')
    assert set(data['flight_fit']) == ({'festival'} if visible else set())


def test_other_category_reads_only_fresh_active_local_events_and_keeps_pagination(
    api_client, isolated_db, monkeypatch,
):
    monkeypatch.setattr(get_settings(), 'events_enabled', True)
    deal, _ = catalog_fixture(isolated_db)
    now = datetime.now(UTC)
    items = [event(f'other-{i}', f'Other {i:02}', category='OTHER', start_date=deal.trip_start)
             for i in range(13)]
    items.append(event('music', start_date=deal.trip_start))
    save_window(isolated_db, deal.destination_id, deal.trip_start, deal.trip_end, items, now)
    # A stale record and an inactive record must not reappear via the new filter.
    from app.models.event import LocalEvent
    stale = event('stale', category='OTHER', start_date=deal.trip_start)
    inactive = event('inactive', category='OTHER', start_date=deal.trip_start)
    for item, active, checked in [(stale, True, now - timedelta(days=30)), (inactive, False, now)]:
        isolated_db.add(LocalEvent(source='ticketmaster', external_id=item.id,
            destination_id=deal.destination_id, start_date=item.start_date, end_date=item.start_date,
            category=item.category, active=active, checked_at=checked, payload=item.model_dump(mode='json')))
    isolated_db.add(EventWindow(destination_id=deal.destination_id, start_date=deal.trip_start,
        end_date=deal.trip_end, checked_at=now, attempted_at=now, status='SUCCEEDED'))
    isolated_db.commit()
    params = {'date_mode': 'stay', 'start_date': str(deal.trip_start),
              'end_date': str(deal.trip_end), 'category': 'OTHER'}
    path = f'/api/v1/deals/{deal.slug}/events'
    first = api_client.get(path, params=params)
    assert first.status_code == 200
    assert first.json()['total'] == 13 and first.json()['has_more']
    assert len(first.json()['events']) == 12
    second = api_client.get(path, params=params | {'page': 2}).json()
    assert second['total'] == 13 and not second['has_more']
    assert len(second['events']) == 1
    assert {e['category'] for e in first.json()['events'] + second['events']} == {'OTHER'}
    assert 'music' not in {e['id'] for e in first.json()['events'] + second['events']}
    assert api_client.get(path, params=params | {'category': 'EXHIBITIONS'}).status_code == 422
