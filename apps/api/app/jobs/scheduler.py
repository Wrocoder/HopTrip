import asyncio
import logging
import os
from datetime import UTC, datetime, timedelta
from time import monotonic
from zoneinfo import ZoneInfo

from app.config import get_settings
from app.jobs.alerts import run_alerts_once
from app.providers.base import ProviderError
from app.services.jobs import PipelineBusy, run_tracked_pipeline

logger = logging.getLogger(__name__)


async def run_scheduled_cycle() -> None:
    await run_pipeline_once()
    try:
        # Retention must run even while outbound email is disabled.
        counts = await asyncio.to_thread(run_alerts_once)
        logger.info("Alert batch: %s", counts)
    except Exception:
        logger.error("Alert batch failed; no automatic SMTP retry")


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
        target = next_calendar_start(datetime.now(UTC), interval, timezone)
        logger.info("Next travel pipeline start: %s", target.astimezone(timezone).isoformat())
        while (delay := (target - datetime.now(UTC)).total_seconds()) > 0:
            # Recheck the wall clock to tolerate host clock corrections.
            await asyncio.sleep(min(delay, 30))
        if (datetime.now(UTC) - target).total_seconds() >= 60:
            logger.warning("Travel pipeline skipped a missed calendar slot")
            continue
        await run_scheduled_cycle()


async def run_scheduler() -> None:
    interval = get_settings().pipeline_interval_seconds
    if timezone := os.environ.get("PIPELINE_SCHEDULE_TIMEZONE"):
        await run_calendar_scheduler(interval, ZoneInfo(timezone))
        return
    next_start = monotonic()
    while True:
        await run_scheduled_cycle()
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
