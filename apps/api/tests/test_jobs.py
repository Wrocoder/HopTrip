import asyncio
from datetime import UTC, datetime

import pytest
from app.db.base import Base
from app.db.session import get_db
from app.jobs.pipeline import PipelineResult
from app.main import app
from app.models.job import JobRun, JobStatus
from app.providers.base import ProviderNotConfigured, ProviderTransientError
from app.services.ingestion import IngestionResult
from app.services.jobs import run_tracked_pipeline
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool


def make_session_factory() -> sessionmaker[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)


def test_tracked_pipeline_persists_success() -> None:
    session_factory = make_session_factory()

    async def fake_pipeline() -> PipelineResult:
        return PipelineResult(
            ingestion=IngestionResult(saved_offers=1),
            statistics_routes=2,
            generated_deals=3,
        )

    result = asyncio.run(run_tracked_pipeline(fake_pipeline, session_factory))

    with session_factory() as db:
        job = db.scalar(select(JobRun))
        assert job is not None
        assert job.status == JobStatus.SUCCEEDED
        assert job.finished_at is not None
        assert job.duration_ms is not None
        assert job.result_json["generated_deals"] == result.generated_deals


def test_pipeline_keeps_each_origin_diagnostics_in_job_result(monkeypatch):
    from types import SimpleNamespace

    import httpx
    from app.jobs import pipeline
    from app.models.data_provider import DataProvider
    from app.providers.travelpayouts import TravelpayoutsDataProvider

    session_factory = make_session_factory()
    with session_factory() as db:
        db.add(DataProvider(code="travelpayouts_data", name="Test"))
        db.commit()

    def handle(request):
        data = (
            [
                None,
                {
                    "origin": "WRO",
                    "destination": "BCN",
                    "price": 200,
                    "departure_at": "2030-10-01",
                    "return_at": "2030-10-04",
                },
            ]
            if request.url.params["origin"] == "WRO"
            else []
        )
        return httpx.Response(200, json={"success": True, "data": data})

    provider = TravelpayoutsDataProvider(token="mock-secret", transport=httpx.MockTransport(handle))
    monkeypatch.setattr(pipeline, "TravelpayoutsDataProvider", lambda: provider)
    monkeypatch.setattr(pipeline, "SessionLocal", session_factory)
    monkeypatch.setattr(
        pipeline, "get_settings", lambda: SimpleNamespace(ingestion_origins="WRO,WAW")
    )
    result = asyncio.run(run_tracked_pipeline(pipeline.run_travelpayouts_pipeline, session_factory))
    with session_factory() as db:
        stored = db.scalar(select(JobRun)).result_json["provider_searches"]
        assert stored == result.provider_searches
        assert [r["origin"] for r in stored] == ["WRO", "WAW"]
        assert [r["rejected_items"] for r in stored] == [1, 0]
        assert [r["offers_returned"] for r in stored] == [1, 0]
        assert [r["stop_reason"] for r in stored] == ["short_page", "empty_page"]
        assert "mock-secret" not in str(stored)


def test_tracked_pipeline_persists_failure() -> None:
    session_factory = make_session_factory()

    async def failing_pipeline() -> PipelineResult:
        raise RuntimeError("provider unavailable")

    with pytest.raises(RuntimeError, match="provider unavailable"):
        asyncio.run(run_tracked_pipeline(failing_pipeline, session_factory))

    with session_factory() as db:
        job = db.scalar(select(JobRun))
        assert job is not None
        assert job.status == JobStatus.FAILED
        assert job.error == "RuntimeError"
        assert job.finished_at is not None


def test_tracked_pipeline_retries_transient_failure() -> None:
    session_factory = make_session_factory()
    calls = 0

    async def flaky_pipeline() -> PipelineResult:
        nonlocal calls
        calls += 1
        if calls == 1:
            raise ProviderTransientError("temporary provider failure")
        return PipelineResult(ingestion=IngestionResult(), statistics_routes=0, generated_deals=0)

    asyncio.run(
        run_tracked_pipeline(
            flaky_pipeline,
            session_factory,
            max_attempts=2,
            retry_delay_seconds=0,
        )
    )

    with session_factory() as db:
        jobs = db.scalars(select(JobRun).order_by(JobRun.attempt)).all()
        assert [job.attempt for job in jobs] == [1, 2]
        assert [job.status for job in jobs] == [JobStatus.FAILED, JobStatus.SUCCEEDED]


def test_tracked_pipeline_does_not_retry_missing_configuration() -> None:
    session_factory = make_session_factory()

    async def missing_configuration() -> PipelineResult:
        raise ProviderNotConfigured("token missing")

    with pytest.raises(ProviderNotConfigured, match="token missing"):
        asyncio.run(
            run_tracked_pipeline(
                missing_configuration,
                session_factory,
                max_attempts=3,
                retry_delay_seconds=0,
            )
        )

    with session_factory() as db:
        assert db.query(JobRun).count() == 1


def test_admin_jobs_endpoint_is_protected_and_lists_runs() -> None:
    session_factory = make_session_factory()
    with session_factory() as db:
        db.add(
            JobRun(
                job_type="TRAVELPAYOUTS_PIPELINE",
                status=JobStatus.SUCCEEDED,
                started_at=datetime.now(UTC),
                finished_at=datetime.now(UTC),
                duration_ms=12,
                result_json={"generated_deals": 1},
            )
        )
        db.commit()

    def override_get_db():
        with session_factory() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        client = TestClient(app)
        assert client.get("/api/v1/admin/jobs").status_code == 401
        response = client.get(
            "/api/v1/admin/jobs",
            headers={"X-Admin-Token": "change-me-in-development"},
        )
        assert response.status_code == 200
        assert response.json()[0]["status"] == "SUCCEEDED"
    finally:
        app.dependency_overrides.clear()
