"""Separate opt-in worker; calendar eligibility is persisted per subscription."""

import argparse
import logging
import time
from datetime import UTC, datetime

from app.config import get_settings
from app.db.session import SessionLocal
from app.services.alert_digests import cleanup, deliver_digests

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


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cleanup-only", action="store_true",
                        help="Apply subscription retention once, without sending email")
    args = parser.parse_args(argv)
    logging.basicConfig(level=get_settings().log_level)
    if args.cleanup_only:
        with SessionLocal() as db:
            cleanup(db, datetime.now(UTC))
    else:
        run_scheduler()


if __name__ == "__main__":
    main()
