"""Four calendar runs daily in Warsaw; --once performs the initial backfill."""
import argparse
import logging
from datetime import UTC, datetime
from time import sleep
from zoneinfo import ZoneInfo

from app.config import get_settings
from app.jobs.scheduler import next_calendar_start
from app.services.event_sync import run_sync


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
        target = next_calendar_start(datetime.now(UTC), 21600, ZoneInfo('Europe/Warsaw'))
        while (delay := (target - datetime.now(UTC)).total_seconds()) > 0:
            sleep(min(delay, 30))
        if (datetime.now(UTC) - target).total_seconds() < 60:
            run_sync(settings)


if __name__ == '__main__':
    raise SystemExit(main())
