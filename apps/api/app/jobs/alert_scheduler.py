"""Separate opt-in worker; calendar eligibility is persisted per subscription."""

import logging
import time

from app.config import get_settings
from app.db.session import SessionLocal
from app.services.alert_digests import deliver_digests

logger = logging.getLogger(__name__)


def run_once() -> dict[str, int]:
    with SessionLocal() as db:
        return deliver_digests(db, get_settings())


def run_scheduler() -> None:
    settings = get_settings()
    if not settings.alerts_enabled or not settings.alerts_digest_enabled:
        logger.info("Digest scheduler disabled")
        return
    while True:
        try:
            logger.info("Digest check: %s", run_once())
        except Exception:
            # No addresses, signed tokens, SMTP replies or connection strings in logs.
            logger.error("Digest check failed; inspect delivery statuses")
        time.sleep(60)


if __name__ == "__main__":
    logging.basicConfig(level=get_settings().log_level)
    run_scheduler()
