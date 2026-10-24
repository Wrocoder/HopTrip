"""Atomic city/date refreshes, isolated from the flight ingestion lock."""
from collections.abc import Callable
from contextlib import contextmanager
from datetime import UTC, date, datetime, timedelta
from ssl import create_default_context
from threading import Lock
from time import monotonic, sleep
from uuid import uuid4
from zoneinfo import ZoneInfo

import httpx
from app.config import Settings
from app.db.session import SessionLocal
from app.models.event import EventWindow, LocalEvent
from app.models.job import JobRun, JobStatus
from app.models.location import Airport, Destination
from app.providers.ticketmaster import EventsUnavailable, TicketmasterProvider
from app.schemas.event import EventRead
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.event_destinations import EventCity, event_city
from sqlalchemy import select, text, update
from sqlalchemy.orm import Session

JOB = 'EVENTS_SYNC'
LOCK_KEY = 486_720_914
_local_lock = Lock()


@contextmanager
def sync_lock(factory):
    with factory() as db:
        postgres = db.get_bind().dialect.name == 'postgresql'
        acquired = (bool(db.scalar(text('SELECT pg_try_advisory_lock(:key)'), {'key': LOCK_KEY}))
                    if postgres else _local_lock.acquire(False))
        try:
            yield acquired
        finally:
            if acquired:
                if postgres:
                    db.execute(text('SELECT pg_advisory_unlock(:key)'), {'key': LOCK_KEY})
                else:
                    _local_lock.release()


def desired_windows(db: Session, settings: Settings, now: datetime):
    """Stable seven-day buckets deduplicate overlapping trips, including one-way stays."""
    wanted = {}
    for deal in db.scalars(available_deals_query()):
        origin = db.get(Airport, deal.origin_airport_id)
        if origin is None or origin.country_code != 'PL':
            continue
        context = serialize_deal(db, deal)
        destination = db.get(Destination, deal.destination_id)
        if destination is None or not destination.is_active:
            continue
        city = event_city(destination.slug, destination.country_code, settings.events_countries,
                          destination.city, destination.timezone)
        if city is None:
            continue
        zone = ZoneInfo(city.timezone)
        today = now.astimezone(zone).date()
        facts = context.flight_facts
        first = facts.outbound_arrival.astimezone(zone).date() if facts.outbound_arrival else deal.trip_start
        last = (facts.return_departure.astimezone(zone).date() if facts.return_departure else deal.trip_end
                ) if context.trip_type == 'ROUND_TRIP' else first + timedelta(days=90)
        first, last = max(first, today), min(last, today + timedelta(days=settings.events_horizon_days))
        cursor = first - timedelta(days=first.weekday())
        while cursor <= last:
            end = cursor + timedelta(days=6)
            wanted[(destination.id, cursor, end)] = city
            cursor = end + timedelta(days=1)
    existing = {(w.destination_id, w.start_date, w.end_date): w.attempted_at
                for w in db.scalars(select(EventWindow))}
    # Never-queried and oldest-attempted buckets first, so quotas cannot starve cities.
    return sorted(wanted.items(), key=lambda item: (
        existing.get(item[0], datetime.min).replace(tzinfo=UTC), item[0][1], item[0][0],
    ))


def save_window(db: Session, destination_id: int, start: date, end: date,
                events: list[EventRead], now: datetime) -> dict[str, int]:
    counts = dict(added=0, updated=0, hidden=0)
    seen = {event.id for event in events}
    for event in {event.id: event for event in events}.values():
        payload = event.model_dump(mode='json')
        row = db.scalar(select(LocalEvent).where(LocalEvent.source == 'ticketmaster',
                                                LocalEvent.external_id == event.id))
        if row is None:
            row = LocalEvent(source='ticketmaster', external_id=event.id)
            db.add(row)
            counts['added'] += 1
        elif row.payload != payload or not row.active or row.destination_id != destination_id:
            counts['updated'] += 1
        row.destination_id, row.start_date = destination_id, event.start_date
        row.end_date, row.category = event.end_date or event.start_date, event.category
        row.payload, row.active, row.checked_at = payload, True, now
    db.flush()
    for row in db.scalars(select(LocalEvent).where(
        LocalEvent.source == 'ticketmaster', LocalEvent.destination_id == destination_id,
        LocalEvent.start_date >= start, LocalEvent.start_date <= end, LocalEvent.active.is_(True),
    )):
        if row.external_id not in seen:
            row.active = False
            counts['hidden'] += 1
    return counts


class RequestBudgetReached(Exception):
    pass


def run_sync(settings: Settings, factory: Callable[[], Session] = SessionLocal,
             provider: TicketmasterProvider | None = None) -> int:
    if not settings.events_sync_enabled:
        return 0
    provider = provider or TicketmasterProvider()
    with sync_lock(factory) as acquired, factory() as db:
        now = datetime.now(UTC)
        if acquired:
            db.execute(update(JobRun).where(JobRun.job_type == JOB, JobRun.status == JobStatus.RUNNING)
                       .values(status=JobStatus.INTERRUPTED, finished_at=now, error='Worker interrupted'))
        job = JobRun(job_type=JOB, run_id=str(uuid4()), started_at=now,
                     status=JobStatus.RUNNING if acquired else JobStatus.SKIPPED,
                     finished_at=None if acquired else now)
        stats = dict(requests=0, windows=0, planned=0, failed=0, added=0, updated=0, hidden=0)
        job.result_json = stats.copy()
        db.add(job)
        db.commit()
        if not acquired:
            return 0
        job_id = job.id
        try:
            if not settings.ticketmaster_api_key.get_secret_value():
                raise EventsUnavailable()
            windows = desired_windows(db, settings, now)
            stats['planned'] = len(windows)
            last_request = 0.0
            with httpx.Client(timeout=15, follow_redirects=False, verify=create_default_context()) as client:
                def fetch(city: EventCity, start: date, end: date) -> list[EventRead]:
                    nonlocal last_request
                    batch = []
                    for page in range(10):
                        today = datetime.now(UTC).date().isoformat()
                        used = sum(int(run.result_json.get('request_days', {}).get(today, 0))
                                   for run in db.scalars(select(JobRun).where(JobRun.job_type == JOB)))
                        if (used >= settings.events_daily_request_limit
                                or stats['requests'] >= settings.events_run_request_limit):
                            raise RequestBudgetReached()
                        sleep(max(0.0, 1.05 - (monotonic() - last_request)))
                        last_request = monotonic()
                        stats['requests'] += 1
                        days = dict(job.result_json.get('request_days', {}))
                        days[today] = days.get(today, 0) + 1
                        job.result_json = {**stats, 'request_days': days}
                        db.commit()  # Reserve quota before network I/O, surviving process restarts.
                        items, more = provider.fetch_page(
                            client, settings.ticketmaster_api_key.get_secret_value(), city,
                            start, end, 'ALL', page, settings.ticketmaster_affiliate_id, True,
                        )
                        batch.extend(items)
                        if not more:
                            return batch
                    # Discovery caps deep pagination; split busy weeks down to individual days.
                    if start == end:
                        raise EventsUnavailable()
                    middle = start + (end - start) // 2
                    return fetch(city, start, middle) + fetch(city, middle + timedelta(days=1), end)

                for (destination_id, start, end), city in windows:
                    window = db.scalar(select(EventWindow).where(
                        EventWindow.destination_id == destination_id,
                        EventWindow.start_date == start, EventWindow.end_date == end,
                    ))
                    if window is None:
                        window = EventWindow(destination_id=destination_id, start_date=start, end_date=end)
                        db.add(window)
                    window.attempted_at, window.status = datetime.now(UTC), 'RUNNING'
                    db.commit()
                    try:
                        items = fetch(city, start, end)
                        checked = datetime.now(UTC)
                        counts = save_window(db, destination_id, start, end, items, checked)
                        for key, count in counts.items():
                            stats[key] += count
                        window.checked_at, window.status = checked, 'SUCCEEDED'
                        stats['windows'] += 1
                        db.commit()
                    except (EventsUnavailable, RequestBudgetReached) as exc:
                        window.status = 'FAILED'
                        stats['failed'] += 1
                        db.commit()
                        if isinstance(exc, RequestBudgetReached) or exc.status_code in (401, 403, 429):
                            break
            job.status = JobStatus.SUCCEEDED if stats['windows'] == stats['planned'] else JobStatus.FAILED
            job.error = None if job.status == JobStatus.SUCCEEDED else 'Incomplete event refresh'
        except Exception:
            db.rollback()
            recovered = db.get(JobRun, job_id)
            assert recovered is not None
            job = recovered
            job.status, job.error = JobStatus.FAILED, 'Event refresh failed'
        job.result_json = {**job.result_json, **stats}
        job.finished_at = datetime.now(UTC)
        job.duration_ms = int((job.finished_at - now).total_seconds() * 1000)
        db.commit()
        return 0 if job.status == JobStatus.SUCCEEDED else 1
