import json

from app.jobs import runner
from app.jobs.pipeline import PipelineResult
from app.providers.base import ProviderNotConfigured
from app.services.ingestion import IngestionResult


def test_runner_prints_pipeline_result(monkeypatch, capsys) -> None:
    async def fake_pipeline() -> PipelineResult:
        return PipelineResult(
            ingestion=IngestionResult(saved_offers=2, updated_offers=1, saved_observations=2),
            statistics_routes=3,
            generated_deals=4,
        )

    monkeypatch.setattr(runner, "run_travelpayouts_pipeline", fake_pipeline)

    assert runner.main() == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["ingestion"]["saved_offers"] == 2
    assert payload["ingestion"]["updated_offers"] == 1
    assert payload["ingestion"]["saved_observations"] == 2
    assert payload["statistics_routes"] == 3
    assert payload["generated_deals"] == 4


def test_runner_returns_configuration_error(monkeypatch, capsys) -> None:
    async def failing_pipeline() -> PipelineResult:
        raise ProviderNotConfigured("Travelpayouts API token is not configured")

    monkeypatch.setattr(runner, "run_travelpayouts_pipeline", failing_pipeline)

    assert runner.main() == 2
    assert "token is not configured" in capsys.readouterr().err
