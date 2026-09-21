import asyncio
from collections.abc import Awaitable, Callable
from contextlib import contextmanager
from dataclasses import asdict
from datetime import UTC, datetime, timedelta
from threading import Lock
from time import monotonic
from uuid import uuid4

from app.db.session import SessionLocal
from app.jobs.pipeline import PipelineResult, run_travelpayouts_pipeline
from app.models.job import JobRun, JobStatus
from app.providers.base import ProviderTransientError
from app.services.deals import expire_deals
from app.services.retention import apply_retention
from sqlalchemy import text, update
from sqlalchemy.orm import Session

Pipeline = Callable[[], Awaitable[PipelineResult]]
SessionFactory = Callable[[], Session]
_local_lock = Lock()
LOCK_KEY = 486_720_913


class PipelineBusy(RuntimeError):
    pass


@contextmanager
def pipeline_lock(session_factory: SessionFactory):
    # Dedicated session/connection retained across ingestion commits and retry sleeps.
    with session_factory() as db:
        postgres = db.get_bind().dialect.name == "postgresql"
        acquired = (
            bool(db.scalar(text("SELECT pg_try_advisory_lock(:key)"), {"key": LOCK_KEY}))
            if postgres
            else _local_lock.acquire(False)
        )
        try:
            yield acquired
        finally:
            if acquired:
                if postgres:
                    db.execute(text("SELECT pg_advisory_unlock(:key)"), {"key": LOCK_KEY})
                else:
                    _local_lock.release()


async def run_tracked_pipeline(
    pipeline: Pipeline = run_travelpayouts_pipeline,
    session_factory: SessionFactory = SessionLocal,
    *,
    max_attempts: int = 1,
    retry_delay_seconds: float = 0.0,
) -> PipelineResult:
    if max_attempts < 1 or retry_delay_seconds < 0:
        raise ValueError("Invalid retry settings")
    run_id = str(uuid4())
    with pipeline_lock(session_factory) as acquired:
        if not acquired:
            with session_factory() as db:
                db.add(
                    JobRun(
                        job_type="TRAVELPAYOUTS_PIPELINE",
                        run_id=run_id,
                        attempt=1,
                        status=JobStatus.SKIPPED,
                        started_at=datetime.now(UTC),
                        finished_at=datetime.now(UTC),
                        error="Pipeline busy",
                    )
                )
                db.commit()
            raise PipelineBusy("Pipeline busy")
        with session_factory() as db:
            # Only the lock owner can recover abandoned records: no arbitrary age heuristic.
            db.execute(
                update(JobRun)
                .where(
                    JobRun.job_type == "TRAVELPAYOUTS_PIPELINE",
                    JobRun.status.in_([JobStatus.RUNNING, JobStatus.RETRYING]),
                )
                .values(status=JobStatus.INTERRUPTED, finished_at=datetime.now(UTC))
            )
            db.commit()
            expire_deals(db)
            apply_retention(db)
        for attempt in range(1, max_attempts + 1):
            started = monotonic()
            with session_factory() as db:
                job: JobRun | None = JobRun(
                    job_type="TRAVELPAYOUTS_PIPELINE",
                    run_id=run_id,
                    attempt=attempt,
                    status=JobStatus.RUNNING,
                    started_at=datetime.now(UTC),
                )
                db.add(job)
                db.commit()
                assert job is not None
                job_id = job.id
            try:
                result = await pipeline()
            except BaseException as exc:
                retry = isinstance(exc, ProviderTransientError) and attempt < max_attempts
                delay = min(
                    300.0,
                    max(
                        retry_delay_seconds * 2 ** (attempt - 1),
                        (exc.retry_after or 0) if isinstance(exc, ProviderTransientError) else 0,
                    ),
                )
                with session_factory() as db:
                    job = db.get(JobRun, job_id)
                    assert job is not None
                    job.status = (
                        JobStatus.RETRYING
                        if retry
                        else (
                            JobStatus.FAILED
                            if isinstance(exc, Exception)
                            else JobStatus.INTERRUPTED
                        )
                    )
                    job.error = type(exc).__name__  # Provider payloads/URLs may contain secrets.
                    job.finished_at = datetime.now(UTC)
                    job.duration_ms = round((monotonic() - started) * 1000)
                    job.next_retry_at = (
                        datetime.now(UTC) + timedelta(seconds=delay) if retry else None
                    )
                    db.commit()
                if not retry:
                    raise
                await asyncio.sleep(delay)
                with session_factory() as db:
                    db.execute(
                        update(JobRun).where(JobRun.id == job_id).values(status=JobStatus.FAILED)
                    )
                    db.commit()
            else:
                with session_factory() as db:
                    job = db.get(JobRun, job_id)
                    assert job is not None
                    job.status = JobStatus.SUCCEEDED
                    job.finished_at = datetime.now(UTC)
                    job.duration_ms = round((monotonic() - started) * 1000)
                    job.result_json = asdict(result)
                    db.commit()
                return result
    raise RuntimeError("Pipeline ended without result")
