from datetime import UTC, datetime, timedelta

import pytest
from app.config import Settings, get_settings
from app.models.event import EventWindow, LocalEvent
from app.models.job import JobRun
from app.providers.ticketmaster import EventsUnavailable, normalize_event
from app.services import event_sync as sync
from app.services.events import EventService
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker
from tests.helpers import catalog_fixture
from tests.test_events import CITY, END, START, raw_event


def sample():
    event = normalize_event(raw_event(), CITY, START, END)
    assert event
    return event


def test_upsert_updates_without_duplicates_and_hides_missing(isolated_db):
    db = isolated_db
    deal, _ = catalog_fixture(db)
    now = datetime.now(UTC)
    args = (db, deal.destination_id, START, END)
    assert sync.save_window(*args, [sample(), sample()], now)['added'] == 1
    db.commit()
    assert sync.save_window(*args, [sample()], now)['updated'] == 0
    changed = sample().model_copy(update={'name': 'New title'})
    assert sync.save_window(*args, [changed], now)['updated'] == 1
    assert sync.save_window(*args, [], now)['hidden'] == 1
    db.commit()
    rows = list(db.scalars(select(LocalEvent)))
    assert len(rows) == 1 and not rows[0].active and rows[0].payload['name'] == 'New title'


def test_read_coverage_empty_partial_and_stale_without_provider(isolated_db):
    db = isolated_db
    deal, _ = catalog_fixture(db)
    settings, now = Settings(), datetime.now(UTC)
    service = EventService()
    args = (settings, deal.destination_id, START, END, 'ALL', db)
    assert service.search(*args).status == 'UNAVAILABLE'
    window = EventWindow(destination_id=deal.destination_id, start_date=START, end_date=END,
                         checked_at=now, attempted_at=now, status='SUCCEEDED')
    db.add(window)
    db.commit()
    assert service.search(*args).status == 'EMPTY'
    sync.save_window(db, deal.destination_id, START, END, [sample()], now)
    db.commit()
    assert service.search(*args).status == 'READY'
    window.status = 'FAILED'
    db.commit()
    assert service.search(*args).partial
    row = db.scalar(select(LocalEvent))
    row.checked_at = now - timedelta(hours=31)
    window.checked_at = row.checked_at
    db.commit()
    assert service.search(*args).status == 'UNAVAILABLE'


@pytest.mark.parametrize('failure', [None, 429, 500, 'second_page', 'budget'])
def test_run_atomicity_quotas_and_job_history(isolated_db, monkeypatch, failure):
    db = isolated_db
    deal, _ = catalog_fixture(db)
    sync.save_window(db, deal.destination_id, START, END, [sample()], datetime.now(UTC))
    db.commit()
    monkeypatch.setattr(sync, 'sleep', lambda _: None)
    monkeypatch.setattr(sync, 'desired_windows', lambda *args: [((deal.destination_id, START, END), CITY)])
    settings = Settings(events_sync_enabled=True, ticketmaster_api_key='not-logged',
                        events_run_request_limit=1 if failure == 'budget' else 1000)
    calls = []

    class Provider:
        def fetch_page(self, *args):
            calls.append(args)
            if isinstance(failure, int):
                raise EventsUnavailable(failure)
            if failure == 'second_page' and len(calls) == 2:
                raise EventsUnavailable()
            return [], failure in ('second_page', 'budget')

    factory = sessionmaker(bind=db.get_bind())
    result = sync.run_sync(settings, factory, Provider())
    db.expire_all()
    job = db.scalar(select(JobRun))
    row = db.scalar(select(LocalEvent))
    assert job.result_json['requests'] == len(calls)
    assert sum(job.result_json['request_days'].values()) == len(calls)
    assert job.finished_at and job.duration_ms >= 0
    if failure:
        assert result == 1 and job.status == 'FAILED' and row.active
    else:
        assert result == 0 and job.status == 'SUCCEEDED' and not row.active
    assert 'not-logged' not in str(job.result_json) + str(job.error)


def test_daily_quota_survives_new_run(isolated_db, monkeypatch):
    db = isolated_db
    deal, _ = catalog_fixture(db)
    today = datetime.now(UTC).date().isoformat()
    db.add(JobRun(job_type=sync.JOB, status='INTERRUPTED', result_json={'request_days': {today: 1}}))
    db.commit()
    monkeypatch.setattr(sync, 'desired_windows', lambda *args: [((deal.destination_id, START, END), CITY)])
    settings = Settings(events_sync_enabled=True, ticketmaster_api_key='fixture', events_daily_request_limit=1)
    assert sync.run_sync(settings, sessionmaker(bind=db.get_bind())) == 1
    db.expire_all()
    job = db.scalar(select(JobRun).order_by(JobRun.id.desc()))
    assert job.result_json['requests'] == 0


def test_separate_lock_and_recovery(isolated_db, monkeypatch):
    factory = sessionmaker(bind=isolated_db.get_bind())
    settings = Settings(events_sync_enabled=True, ticketmaster_api_key='fixture')
    with sync.sync_lock(factory):
        assert sync.run_sync(settings, factory) == 0
    assert isolated_db.scalar(select(JobRun)).status == 'SKIPPED'
    isolated_db.add(JobRun(job_type=sync.JOB, status='RUNNING'))
    isolated_db.commit()
    monkeypatch.setattr(sync, 'desired_windows', lambda *args: [])
    assert sync.run_sync(settings, factory) == 0
    isolated_db.expire_all()
    assert [r.status for r in isolated_db.scalars(select(JobRun).order_by(JobRun.id))] == [
        'SKIPPED', 'INTERRUPTED', 'SUCCEEDED',
    ]


def test_windows_only_current_supported_routes_and_deduplicate(isolated_db, monkeypatch):
    monkeypatch.setattr(get_settings(), 'events_enabled', True)
    deal, _ = catalog_fixture(isolated_db)
    windows = sync.desired_windows(isolated_db, get_settings(), datetime.now(UTC))
    assert windows and all(key[0] == deal.destination_id for key, _ in windows)
    assert all((key[2] - key[1]).days == 6 for key, _ in windows)
    deal.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    isolated_db.commit()
    assert not sync.desired_windows(isolated_db, get_settings(), datetime.now(UTC))


@pytest.mark.parametrize('now,expected', [
    ('2026-10-24T03:00:00+00:00', '2026-10-24T04:00:00+00:00'),
    ('2026-10-24T04:00:00+00:00', '2026-10-25T05:00:00+00:00'),
    ('2026-03-28T05:00:00+00:00', '2026-03-29T04:00:00+00:00'),
])
def test_daily_schedule_keeps_six_am_across_dst(now, expected):
    from app.jobs.event_scheduler import next_event_start
    assert next_event_start(datetime.fromisoformat(now)) == datetime.fromisoformat(expected)
