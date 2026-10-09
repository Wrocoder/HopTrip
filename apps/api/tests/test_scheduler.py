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
    monkeypatch.setattr(scheduler, "run_scheduled_cycle", run)
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


def test_calendar_waits_at_start_and_skips_overrun(monkeypatch):
    now = datetime(2026, 10, 4, 13, 43, tzinfo=UTC).timestamp()
    starts = []

    class Clock:
        @staticmethod
        def now(tz):
            return datetime.fromtimestamp(now, tz)

    async def sleep(delay):
        nonlocal now
        now += delay

    async def run():
        nonlocal now
        starts.append(datetime.fromtimestamp(now, UTC).isoformat())
        if len(starts) == 2:
            raise asyncio.CancelledError
        now += 7300

    monkeypatch.setattr(scheduler, "datetime", Clock)
    monkeypatch.setattr(scheduler.asyncio, "sleep", sleep)
    monkeypatch.setattr(scheduler, "run_scheduled_cycle", run)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(scheduler.run_calendar_scheduler(7200, ZoneInfo("Europe/Warsaw")))
    assert starts == ["2026-10-04T14:00:00+00:00", "2026-10-04T18:00:00+00:00"]
def test_alert_retention_runs_after_pipeline_failure_even_when_disabled(monkeypatch):
    calls = []

    async def failing_pipeline():
        return 2

    monkeypatch.setattr(scheduler, "run_pipeline_once", failing_pipeline)
    monkeypatch.setattr(scheduler, "run_alerts_once", lambda: calls.append("alerts"))
    asyncio.run(scheduler.run_scheduled_cycle())
    assert calls == ["alerts"]
