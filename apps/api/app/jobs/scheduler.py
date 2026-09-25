import asyncio
import logging

from app.config import get_settings
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


async def run_scheduler() -> None:
    interval = get_settings().pipeline_interval_seconds
    while True:
        await run_pipeline_once()
        await asyncio.sleep(interval)


if __name__ == "__main__":
    logging.basicConfig(level=get_settings().log_level)
    try:
        asyncio.run(run_scheduler())
    except KeyboardInterrupt:
        logger.info("Travel data scheduler stopped")
