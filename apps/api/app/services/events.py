"""Read the local catalogue; public requests never contact event providers."""
from datetime import UTC, date, datetime, timedelta

from app.config import Settings
from app.models.event import EventWindow, LocalEvent
from app.schemas.event import EventCategory, EventRead, EventResults
from sqlalchemy import select
from sqlalchemy.orm import Session


class EventService:
    def search(
        self, settings: Settings, destination_id: int, start: date, end: date,
        category: EventCategory, db: Session,
    ) -> EventResults:
        cutoff = datetime.now(UTC) - timedelta(hours=settings.events_max_age_hours)
        windows = list(db.scalars(select(EventWindow).where(
            EventWindow.destination_id == destination_id,
            EventWindow.start_date <= end, EventWindow.end_date >= start,
            EventWindow.checked_at >= cutoff,
        ).order_by(EventWindow.start_date)))
        cursor = start
        for window in windows:
            if window.start_date <= cursor and window.status == 'SUCCEEDED':
                cursor = max(cursor, window.end_date + timedelta(days=1))
        complete = cursor > end
        query = select(LocalEvent).where(
            LocalEvent.destination_id == destination_id, LocalEvent.active.is_(True),
            LocalEvent.start_date <= end, LocalEvent.end_date >= start,
            LocalEvent.checked_at >= cutoff,
        ).order_by(LocalEvent.start_date, LocalEvent.external_id).limit(1001)
        if category != 'ALL':
            query = query.where(LocalEvent.category == category)
        rows = list(db.scalars(query))
        return EventResults(
            status='READY' if rows else ('EMPTY' if complete else 'UNAVAILABLE'),
            events=[EventRead.model_validate(row.payload) for row in rows[:1000]],
            start_date=start, end_date=end,
            checked_at=min((row.checked_at for row in rows), default=None)
            or min((w.checked_at for w in windows if w.checked_at), default=None),
            partial=not complete or len(rows) > 1000,
        )


event_service = EventService()
