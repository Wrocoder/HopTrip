"""Small, demand-driven pilot cache, for the existing single-process API deployment."""

from collections import OrderedDict
from datetime import UTC, date, datetime
from ssl import create_default_context
from threading import Lock
from time import monotonic, sleep

import httpx
from app.config import Settings
from app.providers.ticketmaster import EVENT_CITIES, EventsUnavailable, TicketmasterProvider
from app.schemas.event import EventCategory, EventRead, EventResults, EventSession


def group_sessions(events: list[EventRead]) -> list[EventRead]:
    """Only merge exact titles at a known venue; preserve each ticket product."""
    groups: dict[tuple, EventRead] = {}
    for event in events:
        key = (event.name, event.venue_id, event.city, event.timezone, event.category,
               event.genre, event.id if not event.venue_id else None)
        session = EventSession.model_validate(event.model_dump())
        if key not in groups:
            groups[key] = event.model_copy(deep=True)
            groups[key].sessions = []
        groups[key].sessions.append(session)
    return list(groups.values())


class EventService:
    def __init__(self):
        self.cache: OrderedDict[tuple, tuple[float, EventResults]] = OrderedDict()
        self.lock = Lock()
        self.last_request = 0.0
        self.cooldown_until = 0.0
        self.budget_day: date | None = None
        self.requests = 0

    def search(
        self, settings: Settings, slug: str, start: date, end: date, category: EventCategory,
    ) -> EventResults:
        unavailable = EventResults(status="UNAVAILABLE", start_date=start, end_date=end)
        cache_key = (slug, start, end, category)
        # Bounded wait: bursts do not tie up all application threads behind the provider.
        if not self.lock.acquire(timeout=0.1):
            return unavailable
        try:
            now = monotonic()
            for key, (expiry, _) in list(self.cache.items()):
                if expiry <= now:
                    del self.cache[key]
            if cache_key in self.cache:
                return self.cache[cache_key][1].model_copy(deep=True)
            if now < self.cooldown_until:
                return unavailable
            today = datetime.now(UTC).date()
            if self.budget_day != today:
                self.budget_day, self.requests = today, 0
            events = {}
            more = False
            try:
                # Use the OS trust store (including locally installed enterprise CAs).
                # Certificate and hostname verification remain enabled.
                with httpx.Client(
                    timeout=4.0, follow_redirects=False, verify=create_default_context(),
                ) as client:
                    for page in range(2):
                        if self.requests >= settings.events_daily_request_limit:
                            raise EventsUnavailable()
                        sleep(max(0.0, 1.05 - (monotonic() - self.last_request)))
                        self.last_request = monotonic()
                        self.requests += 1
                        batch, more = TicketmasterProvider().fetch_page(
                            client, settings.ticketmaster_api_key.get_secret_value(),
                            EVENT_CITIES[slug], start, end, category, page,
                        )
                        for event in batch:
                            events[event.id] = event
                        if not more:
                            break
            except EventsUnavailable:
                self.cooldown_until = monotonic() + 60
                # Fail closed, including partial responses before a failed page.
                return unavailable
            ordered = sorted(events.values(), key=lambda e: (e.start_date, str(e.local_time), e.id))
            ordered = group_sessions(ordered)
            result = EventResults(
                status="READY" if ordered else "EMPTY", events=ordered[:12],
                start_date=start, end_date=end, checked_at=datetime.now(UTC),
                partial=more or len(ordered) > 12,
            )
            if len(self.cache) >= 128:
                self.cache.popitem(last=False)
            self.cache[cache_key] = (monotonic() + settings.events_cache_seconds, result)
            return result.model_copy(deep=True)
        finally:
            self.lock.release()


event_service = EventService()
