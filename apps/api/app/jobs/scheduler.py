import asyncio
import logging
import os
from datetime import UTC, datetime, timedelta
from time import monotonic
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import SessionLocal
from app.models.job import JobRun, JobStatus
from app.providers.base import ProviderError
from app.services.jobs import PipelineBusy, run_tracked_pipeline

logger = logging.getLogger(__name__)


async def run_pipeline_once() -> int:
    settings = get_settings()
    try:
        result = await run_tracked_pipeline(
            max_attempts=settings.pipeline_max_attempts,
            retry_delay_seconds=settings.pipeline_retry_delay_seconds,
        )
    except PipelineBusy:
        logger.info("Travel pipeline skipped: another run owns the lock")
        return 0
    except ProviderError as exc:
        logger.error("Travel data pipeline failed: %s", exc)
        return 2
    except Exception:
        logger.error("Travel data pipeline crashed; inspect admin job history")
        return 1

    logger.info(
        "Travel data pipeline succeeded: offers=%s observations=%s deals=%s "
        "links_updated=%s links_unchanged=%s links_invalid=%s",
        result.ingestion.saved_offers + result.ingestion.updated_offers,
        result.ingestion.saved_observations,
        result.generated_deals,
        result.partner_links.updated,
        result.partner_links.unchanged,
        result.partner_links.invalid_sources,
    )
    return 0


def next_calendar_start(now: datetime, interval: int, timezone: ZoneInfo) -> datetime:
    if interval % 3600 or 86400 % interval:
        raise ValueError("Calendar interval must be whole hours and divide 24 hours")
    # Iterate real UTC hours: handles missing/repeated local hours at DST changes.
    candidate = now.astimezone(UTC).replace(minute=0, second=0, microsecond=0)
    candidate += timedelta(hours=1)
    while candidate.astimezone(timezone).hour % (interval // 3600):
        candidate += timedelta(hours=1)
    return candidate


async def run_calendar_scheduler(interval: int, timezone: ZoneInfo) -> None:
    while True:
        try:
            checked = datetime.now(UTC)
            with SessionLocal() as db:
                due = calendar_refresh_due(db, checked, interval, timezone)
            if due:
                logger.info("Running due travel pipeline (scheduled or catch-up)")
                await run_pipeline_once()
        except SQLAlchemyError:
            logger.error("Travel scheduler database unavailable; will retry")
        await asyncio.sleep(60)


def latest_calendar_start(now: datetime, interval: int, timezone: ZoneInfo) -> datetime:
    if interval % 3600 or 86400 % interval:
        raise ValueError("Calendar interval must be whole hours and divide 24 hours")
    candidate = now.astimezone(UTC).replace(minute=0, second=0, microsecond=0)
    while candidate.astimezone(timezone).hour % (interval // 3600):
        candidate -= timedelta(hours=1)
    return candidate


def calendar_refresh_due(db: Session, now: datetime, interval: int, timezone: ZoneInfo) -> bool:
    success = db.scalar(select(JobRun.id).where(
        JobRun.job_type == "TRAVELPAYOUTS_PIPELINE", JobRun.status == JobStatus.SUCCEEDED,
        JobRun.started_at >= latest_calendar_start(now, interval, timezone),
    ).limit(1))
    if success is not None:
        return False
    failed = db.scalar(select(JobRun.id).where(
        JobRun.job_type == "TRAVELPAYOUTS_PIPELINE",
        JobRun.status.in_([JobStatus.FAILED, JobStatus.INTERRUPTED]),
        JobRun.finished_at > now - timedelta(seconds=min(interval, 3600)),
    ).limit(1))
    return failed is None


async def run_scheduler() -> None:
    interval = get_settings().pipeline_interval_seconds
    if timezone := os.environ.get("PIPELINE_SCHEDULE_TIMEZONE"):
        await run_calendar_scheduler(interval, ZoneInfo(timezone))
        return
    next_start = monotonic()
    while True:
        await run_pipeline_once()
        next_start += interval
        now = monotonic()
        if next_start < now:
            # Skip missed slots: never overlap runs or burst to catch up.
            skipped = int((now - next_start) // interval) + 1
            next_start += skipped * interval
            logger.warning("Travel pipeline schedule skipped %s elapsed slots", skipped)
        await asyncio.sleep(max(0.0, next_start - now))


if __name__ == "__main__":
    logging.basicConfig(level=get_settings().log_level)
    try:
        asyncio.run(run_scheduler())
    except KeyboardInterrupt:
        logger.info("Travel data scheduler stopped")
