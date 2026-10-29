"""Daily 06:00 Warsaw refresh with persisted catch-up after missed runs."""
import argparse
import logging
from datetime import UTC, datetime, timedelta
from time import sleep
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import SessionLocal
from app.models.job import JobRun, JobStatus
from app.services.event_sync import JOB, run_sync


def latest_event_start(now: datetime) -> datetime:
    local = now.astimezone(ZoneInfo('Europe/Warsaw'))
    target = local.replace(hour=6, minute=0, second=0, microsecond=0)
    if target > local:
        target -= timedelta(days=1)
    return target.astimezone(UTC)


def event_refresh_due(db: Session, now: datetime) -> bool:
    # Check persisted success, not process uptime. Existing sync locking/quota
    # enforcement also applies to catch-up runs and concurrent manual recovery.
    completed = db.scalar(select(JobRun.id).where(
        JobRun.job_type == JOB, JobRun.status == JobStatus.SUCCEEDED,
        JobRun.started_at >= latest_event_start(now),
    ).limit(1))
    if completed is not None:
        return False
    recent_failure = db.scalar(select(JobRun.id).where(
        JobRun.job_type == JOB,
        JobRun.status.in_([JobStatus.FAILED, JobStatus.INTERRUPTED]),
        JobRun.finished_at > now - timedelta(hours=1),
    ).limit(1))
    return recent_failure is None


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
        try:
            checked = datetime.now(UTC)
            with SessionLocal() as db:
                due = event_refresh_due(db, checked)
            if due:
                logging.info('Running due event refresh (scheduled or catch-up)')
                run_sync(settings)
        except SQLAlchemyError:
            # Do not log exception strings containing database connection details.
            logging.error('Event scheduler database unavailable; will retry')
        sleep(60)


if __name__ == '__main__':
    logging.basicConfig(level=get_settings().log_level)
    raise SystemExit(main())
