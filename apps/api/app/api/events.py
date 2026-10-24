from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.deal import Deal
from app.models.location import Destination
from app.schemas.event import EventCategory, EventResults
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.event_destinations import event_city
from app.services.events import event_service

router = APIRouter(prefix="/api/v1", tags=["events"])


@router.get("/deals/{slug}/events", response_model=EventResults)
def deal_events(
    slug: str, start_date: date | None = None, end_date: date | None = None,
    category: EventCategory = "ALL", db: Session = Depends(get_db),
) -> EventResults:
    settings = get_settings()
    if not settings.events_enabled:
        return EventResults(status="DISABLED")
    deal = db.scalar(available_deals_query().where(Deal.slug == slug))
    if deal is None:
        raise HTTPException(404, "Deal not found")
    context = serialize_deal(db, deal)
    if not context.events_supported:
        return EventResults(status="UNSUPPORTED")
    destination = db.get(Destination, deal.destination_id)
    city = event_city(context.destination_slug, context.destination_country_code, settings.events_countries,
                      destination.city if destination else '', destination.timezone if destination else None)
    if city is None:
        return EventResults(status="UNSUPPORTED")
    zone = ZoneInfo(city.timezone)
    facts = context.flight_facts
    arrival = facts.outbound_arrival
    departure = facts.return_departure if context.trip_type == "ROUND_TRIP" else None
    # Use arrival/return departure in destination time, not departure dates in Poland.
    trip_start = arrival.astimezone(zone).date() if arrival else deal.trip_start
    trip_end = departure.astimezone(zone).date() if departure else deal.trip_end
    if (start_date is None) != (end_date is None):
        raise HTTPException(422, "Both dates are required")
    if start_date is None or end_date is None:
        if context.trip_type == "ONE_WAY":
            return EventResults(status="NEEDS_DATES")
        start_date, end_date = trip_start, min(trip_end, trip_start + timedelta(days=30))
    if (
        end_date < start_date or (end_date - start_date).days > 30
        or start_date < trip_start or end_date > trip_start + timedelta(days=90)
        or (context.trip_type == "ROUND_TRIP" and end_date > trip_end)
    ):
        raise HTTPException(422, "Dates must fit the trip; maximum event search is 31 days")
    now = datetime.now(UTC)
    start_date = max(start_date, now.astimezone(zone).date())
    if end_date < start_date:
        return EventResults(status="EMPTY", start_date=start_date, end_date=end_date)
    result = event_service.search(settings, deal.destination_id, start_date, end_date, category, db)
    if result.status not in {"READY", "EMPTY"}:
        return result
    # Recheck cached results against this flight and the clock on every response.
    eligible = []
    for event in result.events:
        if (event.end_date or event.start_date) < start_date:
            continue
        if event.local_time and (not event.end_date or event.end_date == event.start_date):
            local = datetime.combine(event.start_date, event.local_time, zone)
            instants = [local.replace(fold=fold).astimezone(UTC) for fold in (0, 1)]
            if all(t < now or (arrival is not None and t < arrival)
                   or (departure is not None and t >= departure) for t in instants):
                continue
        eligible.append(event)
    result.events = eligible[:12]
    result.partial = result.partial or len(eligible) > 12
    result.status = "READY" if result.events else "EMPTY"
    return result
