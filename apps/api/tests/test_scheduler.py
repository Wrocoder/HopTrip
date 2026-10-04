import asyncio
from types import SimpleNamespace

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
