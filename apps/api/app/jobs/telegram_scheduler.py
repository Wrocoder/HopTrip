"""Separate personal-alert bot worker; never uses the operational monitoring bot."""

import argparse
import logging
import time
from datetime import UTC, datetime

from app.config import get_settings
from app.db.session import SessionLocal
from app.services.telegram_delivery import deliver_once
from app.services.telegram_subscriptions import cleanup

logger = logging.getLogger(__name__)


def run_once() -> dict[str, int]:
    with SessionLocal() as db:
        return deliver_once(db, get_settings())


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--once', action='store_true')
    parser.add_argument('--cleanup-only', action='store_true')
    args = parser.parse_args(argv)
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    if args.cleanup_only:
        with SessionLocal() as db:
            cleanup(db, datetime.now(UTC))
        return
    if not settings.telegram_enabled:
        logger.info('Personal Telegram worker disabled')
        return
    while True:
        try:
            logger.info('Personal Telegram check: %s', run_once())
        except Exception:
            logger.error('Personal Telegram check failed; sensitive details suppressed')
        if args.once:
            return
        time.sleep(1)


if __name__ == '__main__':
    main()
