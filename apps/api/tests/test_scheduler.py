import asyncio
from datetime import UTC, datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import pytest
from app.jobs import scheduler
from app.jobs.pipeline import PipelineResult
from app.providers.base import ProviderError
from app.services.ingestion import IngestionResult


def test_scheduler_runs_pipeline_once(monkeypatch) -> None:
    async def fake_pipeline(**_kwargs) -> PipelineResult:
        return PipelineResult(ingestion=IngestionResult(), statistics_routes=0, generated_deals=0)

    monkeypatch.setattr(scheduler, "run_tracked_pipeline", fake_pipeline)

    assert asyncio.run(scheduler.run_pipeline_once()) == 0


def test_scheduler_reports_provider_failure(monkeypatch) -> None:
    async def failing_pipeline(**_kwargs) -> PipelineResult:
        raise ProviderError("provider is unavailable")

    monkeypatch.setattr(scheduler, "run_tracked_pipeline", failing_pipeline)

    assert asyncio.run(scheduler.run_pipeline_once()) == 2


def test_scheduler_reports_unexpected_failure(monkeypatch) -> None:
    async def crashing_pipeline(**_kwargs) -> PipelineResult:
        raise RuntimeError("unexpected failure")

    monkeypatch.setattr(scheduler, "run_tracked_pipeline", crashing_pipeline)

    assert asyncio.run(scheduler.run_pipeline_once()) == 1


@pytest.mark.parametrize(
    ("durations", "oversleep", "expected_starts"),
    [
        ([9, 16, 8], 0, [0, 3600, 7200]),
        ([3600, 8, 9], 0, [0, 3600, 7200]),
        ([3700, 8, 9], 0, [0, 7200, 10800]),
        ([7200, 8, 9], 0, [0, 10800, 14400]),
        ([9, 8, 9], 7, [0, 3607, 7207]),
    ],
)
def test_scheduler_keeps_cadence_and_skips_overruns(
    monkeypatch, durations, oversleep, expected_starts
) -> None:
    now = 0
    monkeypatch.delenv("PIPELINE_SCHEDULE_TIMEZONE", raising=False)
    starts = []

    async def run():
        nonlocal now
        starts.append(now)
        now += durations[len(starts) - 1]
        return 0

    async def sleep(delay):
        nonlocal now
        assert delay >= 0
        if len(starts) == len(durations):
            raise asyncio.CancelledError
        now += delay + oversleep

    monkeypatch.setattr(scheduler, "monotonic", lambda: now)
    monkeypatch.setattr(
        scheduler, "get_settings", lambda: SimpleNamespace(pipeline_interval_seconds=3600)
    )
    monkeypatch.setattr(scheduler, "run_pipeline_once", run)
    monkeypatch.setattr(scheduler.asyncio, "sleep", sleep)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(scheduler.run_scheduler())
    assert starts == expected_starts


@pytest.mark.parametrize("now,expected", [
    ("2026-10-04T13:43:00+00:00", "2026-10-04T14:00:00+00:00"),
    ("2026-10-04T14:00:01+00:00", "2026-10-04T16:00:00+00:00"),
    ("2026-10-04T22:01:00+00:00", "2026-10-05T00:00:00+00:00"),
    ("2026-03-29T00:59:00+00:00", "2026-03-29T02:00:00+00:00"),
    ("2026-10-25T00:01:00+00:00", "2026-10-25T01:00:00+00:00"),
])
def test_calendar_slots_include_dst(now, expected):
    assert scheduler.next_calendar_start(
        datetime.fromisoformat(now), 7200, ZoneInfo("Europe/Warsaw")
    ) == datetime.fromisoformat(expected)


def test_calendar_waits_at_start_and_catches_latest_missed_slot(monkeypatch):
    from contextlib import nullcontext

    now = datetime(2026, 10, 4, 13, 43, tzinfo=UTC).timestamp()
    last_success = datetime(2026, 10, 4, 12, tzinfo=UTC)
    starts = []

    class Clock:
        @staticmethod
        def now(tz):
            return datetime.fromtimestamp(now, tz)

    async def sleep(delay):
        nonlocal now
        now += delay

    async def run():
        nonlocal now, last_success
        last_success = datetime.fromtimestamp(now, UTC)
        starts.append(datetime.fromtimestamp(now, UTC).isoformat())
        if len(starts) == 2:
            raise asyncio.CancelledError
        now += 7300

    monkeypatch.setattr(scheduler, "datetime", Clock)
    monkeypatch.setattr(scheduler, "SessionLocal", lambda: nullcontext(None))
    monkeypatch.setattr(scheduler, "calendar_refresh_due", lambda db, checked, interval, zone:
                        checked >= scheduler.next_calendar_start(last_success, interval, zone))
    monkeypatch.setattr(scheduler.asyncio, "sleep", sleep)
    monkeypatch.setattr(scheduler, "run_pipeline_once", run)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(scheduler.run_calendar_scheduler(7200, ZoneInfo("Europe/Warsaw")))
    assert starts == ["2026-10-04T14:00:00+00:00", "2026-10-04T16:02:40+00:00"]


@pytest.mark.parametrize('checked,slot', [
    ('2026-10-29T13:43:00+00:00', '2026-10-29T13:00:00+00:00'),
    ('2026-10-25T01:30:00+00:00', '2026-10-25T01:00:00+00:00'),
    ('2026-10-25T00:30:00+00:00', '2026-10-25T00:00:00+00:00'),
    ('2026-03-29T01:30:00+00:00', '2026-03-28T23:00:00+00:00'),
])
def test_latest_flight_slot_uses_real_hours_across_dst(checked, slot):
    assert scheduler.latest_calendar_start(datetime.fromisoformat(checked), 7200,
                                           ZoneInfo('Europe/Warsaw')) == datetime.fromisoformat(slot)


def test_flight_catchup_persists_success_and_failure_backoff(isolated_db):
    from datetime import timedelta

    from app.models.job import JobRun

    checked = datetime(2026, 10, 29, 14, 30, tzinfo=UTC)
    zone = ZoneInfo('Europe/Warsaw')
    assert scheduler.calendar_refresh_due(isolated_db, checked, 7200, zone)
    isolated_db.add(JobRun(job_type='TRAVELPAYOUTS_PIPELINE', status='FAILED',
                           started_at=checked - timedelta(minutes=10), finished_at=checked))
    isolated_db.commit()
    assert not scheduler.calendar_refresh_due(isolated_db, checked, 7200, zone)
    assert scheduler.calendar_refresh_due(isolated_db, checked + timedelta(hours=1), 7200, zone)
    isolated_db.add(JobRun(job_type='TRAVELPAYOUTS_PIPELINE', status='SUCCEEDED',
                           started_at=checked, finished_at=checked))
    isolated_db.commit()
    assert not scheduler.calendar_refresh_due(isolated_db, checked + timedelta(minutes=1), 7200, zone)


def test_calendar_startup_uses_persisted_history(isolated_db, monkeypatch):
    from contextlib import nullcontext

    from app.models.job import JobRun

    calls = []

    async def run():
        calls.append(True)
        isolated_db.add(JobRun(job_type='TRAVELPAYOUTS_PIPELINE', status='SUCCEEDED',
                               started_at=datetime.now(UTC), finished_at=datetime.now(UTC)))
        isolated_db.commit()

    async def stop(_):
        raise asyncio.CancelledError()

    monkeypatch.setattr(scheduler, 'SessionLocal', lambda: nullcontext(isolated_db))
    monkeypatch.setattr(scheduler, 'run_pipeline_once', run)
    monkeypatch.setattr(scheduler.asyncio, 'sleep', stop)
    for _ in range(2):
        with pytest.raises(asyncio.CancelledError):
            asyncio.run(scheduler.run_calendar_scheduler(7200, ZoneInfo('Europe/Warsaw')))
    assert len(calls) == 1
