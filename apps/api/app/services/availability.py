from datetime import UTC, datetime

from app.models.deal import Deal, DealComponent
from app.models.offer import TravelOffer
from app.services.price_lifetime import MAX_PRICE_AGE, fresh_price_clause
from sqlalchemy import Select, or_, select

DEAL_FRESHNESS = MAX_PRICE_AGE


def available_deals_query(now: datetime | None = None) -> Select[tuple[Deal]]:
    """Enforce freshness at read time, even when the worker is stopped."""
    checked_at = now or datetime.now(UTC)
    invalid_offer = select(DealComponent.id).join(
        TravelOffer, TravelOffer.id == DealComponent.travel_offer_id,
    ).where(DealComponent.deal_id == Deal.id, DealComponent.component_type == "FLIGHT", or_(
        ~fresh_price_clause(TravelOffer.last_verified_at, TravelOffer.depart_at, checked_at),
        TravelOffer.expires_at <= checked_at,
        TravelOffer.depart_at <= checked_at,
    )).exists()
    return select(Deal).where(
        Deal.is_visible.is_(True),
        Deal.status == "ACTIVE",
        fresh_price_clause(Deal.last_verified_at, Deal.depart_at, checked_at, Deal.trip_start),
        ~invalid_offer,
        Deal.expires_at.is_(None) | (Deal.expires_at > checked_at),
        (Deal.depart_at > checked_at)
        | (Deal.depart_at.is_(None) & (Deal.trip_start > checked_at.date())),
    )
