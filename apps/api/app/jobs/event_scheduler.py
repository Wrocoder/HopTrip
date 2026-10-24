"""One daily run at 06:00 Warsaw time; --once performs the initial backfill."""
import argparse
import logging
from datetime import UTC, datetime, timedelta
from time import sleep
from zoneinfo import ZoneInfo

from app.config import get_settings
from app.services.event_sync import run_sync


def next_event_start(now: datetime) -> datetime:
    local = now.astimezone(ZoneInfo('Europe/Warsaw'))
    target = local.replace(hour=6, minute=0, second=0, microsecond=0)
    if target <= local:
        target += timedelta(days=1)
    return target.astimezone(UTC)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--once', action='store_true')
    args = parser.parse_args()
    settings = get_settings()
    if not settings.events_sync_enabled:
        logging.error('Event synchronization is disabled')
        return 1
    if args.once:
        return run_sync(settings)
    while True:
        target = next_event_start(datetime.now(UTC))
        logging.info('Next event refresh: %s', target.astimezone(ZoneInfo('Europe/Warsaw')).isoformat())
        while (delay := (target - datetime.now(UTC)).total_seconds()) > 0:
            sleep(min(delay, 30))
        if (datetime.now(UTC) - target).total_seconds() < 60:
            run_sync(settings)


if __name__ == '__main__':
    logging.basicConfig(level=get_settings().log_level)
    raise SystemExit(main())
