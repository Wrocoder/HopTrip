import asyncio
from datetime import UTC, datetime

import pytest
from app.db.base import Base
from app.db.session import get_db
from app.jobs.pipeline import PipelineResult
from app.main import app
from app.models.job import JobRun, JobStatus
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
        assert job.error == "provider unavailable"
        assert job.finished_at is not None


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
