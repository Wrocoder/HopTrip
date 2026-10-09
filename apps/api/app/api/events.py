from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.deal import Deal
from app.providers.ticketmaster import EVENT_CITIES
from app.schemas.event import EventCategory, EventResults
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.events import event_service

router = APIRouter(prefix="/api/v1", tags=["events"])


@router.get("/deals/{slug}/events", response_model=EventResults)
def deal_events(
    slug: str, start_date: date | None = None, end_date: date | None = None,
    category: EventCategory = "ALL", db: Session = Depends(get_db),
) -> EventResults:
    settings = get_settings()
    if not settings.events_enabled or not settings.ticketmaster_api_key.get_secret_value():
        return EventResults(status="DISABLED")
    deal = db.scalar(available_deals_query().where(Deal.slug == slug))
    if deal is None:
        raise HTTPException(404, "Deal not found")
    context = serialize_deal(db, deal)
    if not context.events_supported:
        return EventResults(status="UNSUPPORTED")
    if (start_date is None) != (end_date is None):
        raise HTTPException(422, "Both dates are required")
    if start_date is None or end_date is None:
        if context.trip_type == "ONE_WAY":
            return EventResults(status="NEEDS_DATES")
        start_date, end_date = deal.trip_start, deal.trip_end
    if (
        end_date < start_date or (end_date - start_date).days > 30
        or start_date < deal.trip_start or end_date > deal.trip_start + timedelta(days=90)
        or (context.trip_type == "ROUND_TRIP" and end_date > deal.trip_end)
    ):
        raise HTTPException(422, "Dates must fit the trip; maximum event search is 31 days")
    if context.destination_slug not in EVENT_CITIES:
        return EventResults(status="UNSUPPORTED")
    return event_service.search(settings, context.destination_slug, start_date, end_date, category)
