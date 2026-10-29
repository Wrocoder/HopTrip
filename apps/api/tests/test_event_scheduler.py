from datetime import UTC, datetime, timedelta

import pytest
from app.jobs.event_scheduler import event_refresh_due, latest_event_start
from app.models.job import JobRun


@pytest.mark.parametrize('now,slot', [
    ('2026-10-29T04:59:00+00:00', '2026-10-28T05:00:00+00:00'),
    ('2026-10-29T05:00:00+00:00', '2026-10-29T05:00:00+00:00'),
    ('2026-10-29T17:00:00+00:00', '2026-10-29T05:00:00+00:00'),
    ('2026-10-25T04:30:00+00:00', '2026-10-24T04:00:00+00:00'),
    ('2026-03-29T04:00:00+00:00', '2026-03-29T04:00:00+00:00'),
])
def test_latest_slot_uses_warsaw_calendar_across_dst(now, slot):
    assert latest_event_start(datetime.fromisoformat(now)) == datetime.fromisoformat(slot)


def test_missed_slot_catches_up_and_success_survives_restart(isolated_db):
    now = datetime(2026, 10, 29, 17, tzinfo=UTC)
    db = isolated_db
    db.add(JobRun(job_type='EVENTS_SYNC', status='SUCCEEDED',
                  started_at=now - timedelta(days=1), finished_at=now - timedelta(days=1)))
    db.commit()
    assert event_refresh_due(db, now)
    db.add(JobRun(job_type='EVENTS_SYNC', status='SUCCEEDED', started_at=now,
                  finished_at=now + timedelta(minutes=15)))
    db.commit()
    assert not event_refresh_due(db, now + timedelta(minutes=16))
    assert event_refresh_due(db, now + timedelta(days=1))


@pytest.mark.parametrize('status', ['FAILED', 'INTERRUPTED'])
def test_failure_backoff_is_persisted_and_expires(isolated_db, status):
    now = datetime(2026, 10, 29, 17, tzinfo=UTC)
    db = isolated_db
    db.add(JobRun(job_type='EVENTS_SYNC', status=status,
                  started_at=now - timedelta(minutes=20), finished_at=now - timedelta(minutes=10)))
    db.commit()
    assert not event_refresh_due(db, now)
    assert event_refresh_due(db, now + timedelta(minutes=50))


def test_skipped_or_unrelated_jobs_do_not_suppress_recovery(isolated_db):
    now = datetime(2026, 10, 29, 17, tzinfo=UTC)
    db = isolated_db
    db.add(JobRun(job_type='EVENTS_SYNC', status='SKIPPED', started_at=now, finished_at=now))
    db.add(JobRun(job_type='TRAVELPAYOUTS_PIPELINE', status='SUCCEEDED',
                  started_at=now, finished_at=now))
    db.commit()
    assert event_refresh_due(db, now)


def test_scheduler_startup_recovers_missed_run_once(isolated_db, monkeypatch):
    from contextlib import nullcontext
    from types import SimpleNamespace

    from app.jobs import event_scheduler as scheduler

    class EndPoll(Exception):
        pass

    def stop(_):
        raise EndPoll()

    calls = []

    def run(settings):
        calls.append(settings)
        isolated_db.add(JobRun(job_type='EVENTS_SYNC', status='SUCCEEDED',
                               started_at=datetime.now(UTC), finished_at=datetime.now(UTC)))
        isolated_db.commit()

    monkeypatch.setattr('sys.argv', ['event_scheduler'])
    monkeypatch.setattr(scheduler, 'get_settings', lambda: SimpleNamespace(events_sync_enabled=True))
    monkeypatch.setattr(scheduler, 'SessionLocal', lambda: nullcontext(isolated_db))
    monkeypatch.setattr(scheduler, 'run_sync', run)
    monkeypatch.setattr(scheduler, 'sleep', stop)
    for _ in range(2):
        with pytest.raises(EndPoll):
            scheduler.main()
    assert len(calls) == 1


def test_database_outage_retries_without_logging_connection_details(monkeypatch, caplog):
    from types import SimpleNamespace

    from app.jobs import event_scheduler as scheduler
    from sqlalchemy.exc import SQLAlchemyError

    class EndPoll(Exception):
        pass

    def unavailable():
        raise SQLAlchemyError('private-database-connection')

    def stop(_):
        raise EndPoll()

    monkeypatch.setattr('sys.argv', ['event_scheduler'])
    monkeypatch.setattr(scheduler, 'get_settings', lambda: SimpleNamespace(events_sync_enabled=True))
    monkeypatch.setattr(scheduler, 'SessionLocal', unavailable)
    monkeypatch.setattr(scheduler, 'sleep', stop)
    with pytest.raises(EndPoll):
        scheduler.main()
    assert 'will retry' in caplog.text
    assert 'private-database-connection' not in caplog.text
