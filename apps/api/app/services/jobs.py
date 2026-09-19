from collections.abc import Awaitable, Callable
from dataclasses import asdict
from datetime import UTC, datetime
from time import monotonic

from app.db.session import SessionLocal
from app.jobs.pipeline import PipelineResult, run_travelpayouts_pipeline
from app.models.job import JobRun, JobStatus
from sqlalchemy.orm import Session

Pipeline = Callable[[], Awaitable[PipelineResult]]
SessionFactory = Callable[[], Session]


async def run_tracked_pipeline(
    pipeline: Pipeline = run_travelpayouts_pipeline,
    session_factory: SessionFactory = SessionLocal,
) -> PipelineResult:
    """Run the ingestion pipeline and persist a durable execution record."""
    started_at = datetime.now(UTC)
    started_clock = monotonic()
    with session_factory() as db:
        job = JobRun(
            job_type="TRAVELPAYOUTS_PIPELINE",
            status=JobStatus.RUNNING,
            started_at=started_at,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job_id = job.id

    try:
        result = await pipeline()
    except Exception as exc:
        _finish_job(
            job_id=job_id,
            status=JobStatus.FAILED,
            started_clock=started_clock,
            error=str(exc),
            session_factory=session_factory,
        )
        raise

    _finish_job(
        job_id=job_id,
        status=JobStatus.SUCCEEDED,
        started_clock=started_clock,
        result=asdict(result),
        session_factory=session_factory,
    )
    return result


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
