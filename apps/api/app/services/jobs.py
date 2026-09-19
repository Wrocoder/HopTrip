import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import asdict
from datetime import UTC, datetime
from time import monotonic

from app.db.session import SessionLocal
from app.jobs.pipeline import PipelineResult, run_travelpayouts_pipeline
from app.models.job import JobRun, JobStatus
from app.providers.base import ProviderNotConfigured
from sqlalchemy.orm import Session

Pipeline = Callable[[], Awaitable[PipelineResult]]
SessionFactory = Callable[[], Session]


async def run_tracked_pipeline(
    pipeline: Pipeline = run_travelpayouts_pipeline,
    session_factory: SessionFactory = SessionLocal,
    *,
    max_attempts: int = 1,
    retry_delay_seconds: float = 0.0,
) -> PipelineResult:
    """Run the ingestion pipeline and persist a durable execution record."""
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")
    if retry_delay_seconds < 0:
        raise ValueError("retry_delay_seconds cannot be negative")
    for attempt in range(1, max_attempts + 1):
        started_clock = monotonic()
        job_id = _start_job(datetime.now(UTC), attempt, session_factory)
        try:
            result = await pipeline()
        except ProviderNotConfigured as exc:
            _finish_job(
                job_id=job_id,
                status=JobStatus.FAILED,
                started_clock=started_clock,
                error=str(exc),
                session_factory=session_factory,
            )
            raise
        except Exception as exc:
            _finish_job(
                job_id=job_id,
                status=JobStatus.FAILED,
                started_clock=started_clock,
                error=str(exc),
                session_factory=session_factory,
            )
            if attempt == max_attempts:
                raise
            await asyncio.sleep(retry_delay_seconds * 2 ** (attempt - 1))
            continue

        _finish_job(
            job_id=job_id,
            status=JobStatus.SUCCEEDED,
            started_clock=started_clock,
            result=asdict(result),
            session_factory=session_factory,
        )
        return result

    raise RuntimeError("Pipeline ended without a result")


def _start_job(started_at: datetime, attempt: int, session_factory: SessionFactory) -> int:
    with session_factory() as db:
        job = JobRun(
            job_type="TRAVELPAYOUTS_PIPELINE",
            status=JobStatus.RUNNING,
            attempt=attempt,
            started_at=started_at,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job.id


def _finish_job(
    *,
    job_id: int,
    status: JobStatus,
    started_clock: float,
    session_factory: SessionFactory,
    error: str | None = None,
    result: dict[str, object] | None = None,
) -> None:
    finished_at = datetime.now(UTC)
    with session_factory() as db:
        job = db.get(JobRun, job_id)
        if job is None:
            return
        job.status = status
        job.finished_at = finished_at
        job.duration_ms = max(0, round((monotonic() - started_clock) * 1000))
        job.error = error[:2000] if error else None
        if result is not None:
            job.result_json = result
        db.commit()
