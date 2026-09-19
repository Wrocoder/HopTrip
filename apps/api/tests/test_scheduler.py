import asyncio

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
