"""Calendar dates at the departure airport of each leg, not UTC dates."""
from datetime import date
from zoneinfo import ZoneInfo

from app.models.offer import TravelOffer
from app.services.flight_facts import flight_facts


def trip_dates(offer: TravelOffer) -> tuple[date, date | None]:
    facts = flight_facts(offer)
    start = offer.depart_at.date()
    end = offer.return_at.date() if offer.return_at else None
    if facts.outbound_departure:
        start = (facts.outbound_departure.astimezone(ZoneInfo(facts.origin_timezone))
                 if facts.origin_timezone else facts.outbound_departure).date()
    if facts.return_departure:
        end = (facts.return_departure.astimezone(ZoneInfo(facts.return_origin_timezone))
               if facts.return_origin_timezone else facts.return_departure).date()
    return start, end
