"""Conservative grouping of explicit ticket variants, never artist-only grouping."""
import re
import unicodedata
from datetime import time
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.schemas.event import EventRead, EventTicketOption
from app.services.event_flight_fit import event_instants

PREMIUM = re.compile(r"\s+[-–—]\s+(?:Venue\s+)?Premium(?:\s+Tickets)?\s*$", re.IGNORECASE)


def normalized(value: str) -> str:
    return ' '.join(unicodedata.normalize('NFKC', value).casefold().split())


def group_events(events: list[EventRead]) -> list[EventRead]:
    buckets: dict[tuple, list[EventRead]] = {}
    for event in events:
        title = PREMIUM.sub('', event.name).strip()
        try:
            starts = event_instants(event, ZoneInfo(event.timezone))
        except (ValueError, ZoneInfoNotFoundError):
            starts = []
        # Missing venue IDs or ambiguous clocks cannot prove the same session.
        key = (normalized(title), event.start_date, starts[0], event.timezone, event.venue_id,
               normalized(event.venue), normalized(event.city), event.category, event.status,
               event.end_date or event.start_date) if (
                   title and len(starts) == 1 and event.venue_id and event.venue.strip()
               ) else ('unconfirmed', event.id)
        buckets.setdefault(key, []).append(event)
    result = []
    for items in buckets.values():
        standard = [item for item in items if not PREMIUM.search(item.name)]
        premium = [item for item in items if PREMIUM.search(item.name)]
        if not standard or not premium:
            result.extend(items)
            continue
        ordered = sorted(standard, key=lambda item: item.id) + sorted(premium, key=lambda item: item.id)
        representative = ordered[0]
        options = [EventTicketOption(**item.model_dump(exclude={
            'name', 'category', 'genre', 'venue', 'venue_id', 'city', 'sessions', 'ticket_options',
        }), name=item.name, ticket_kind='PREMIUM' if PREMIUM.search(item.name) else 'STANDARD') for item in ordered]
        result.append(representative.model_copy(update={'ticket_options': options}))
    return sorted(result, key=lambda item: (item.start_date, item.local_time.replace(tzinfo=None) if item.local_time else time.max,
                                            normalized(item.name), item.id))
