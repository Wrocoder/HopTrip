from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.deal import Deal, DealComponent
from app.models.offer import TravelOffer
from app.models.statistics import RouteStatistics
from app.services.scoring import score_flight_deal
from sqlalchemy import select
from sqlalchemy.orm import Session


def generate_flight_deal(db: Session, offer: TravelOffer, now: datetime | None = None) -> Deal | None:
    if offer.price_pln is None or offer.origin_airport_id is None or offer.destination_id is None:
        return None
    checked_at = now or datetime.now(UTC)
    stats = db.scalar(
        select(RouteStatistics)
        .where(
            RouteStatistics.data_provider_id == offer.data_provider_id,
            RouteStatistics.origin_airport_id == offer.origin_airport_id,
            RouteStatistics.destination_id == offer.destination_id,
            RouteStatistics.product_type == offer.product_type,
            RouteStatistics.departure_month == offer.depart_at.strftime("%Y-%m"),
        )
        .order_by(RouteStatistics.trip_duration_days.is_(None))
    )
    score = score_flight_deal(
        current_price=Decimal(offer.price_pln),
        baseline_price=stats.median_price_pln if stats else None,
        p25_price=stats.p25_price_pln if stats else None,
        p75_price=stats.p75_price_pln if stats else None,
        confidence=stats.confidence if stats else Decimal(0),
        expires_at=offer.expires_at,
        now=checked_at,
    )
    trip_end = offer.return_at.date() if offer.return_at else offer.depart_at.date()
    slug = f"flight-{offer.id}-{offer.depart_at:%Y-%m-%d}"
    deal = db.scalar(select(Deal).where(Deal.slug == slug))
    values = {
        "origin_airport_id": offer.origin_airport_id,
        "destination_id": offer.destination_id,
        "trip_start": offer.depart_at.date(),
        "trip_end": trip_end,
        "nights": (trip_end - offer.depart_at.date()).days if offer.return_at else None,
        "travelers": 1,
        "flight_price_pln": offer.price_pln,
        "hotel_price_pln": None,
        "other_costs_pln": Decimal(0),
        "total_estimated_pln": offer.price_pln,
        "price_per_person_pln": offer.price_pln,
        "historical_baseline_pln": stats.median_price_pln if stats else None,
        "discount_percent": score.discount_percent,
        "deal_score": score.deal_score,
        "confidence": stats.confidence if stats else Decimal(0),
        "status": "ACTIVE" if not offer.expires_at or offer.expires_at > checked_at else "EXPIRED",
        "explanation": score.explanation,
        "last_verified_at": offer.last_verified_at,
        "expires_at": offer.expires_at,
        "is_visible": not offer.expires_at or offer.expires_at > checked_at,
    }
    if deal is None:
        deal = Deal(slug=slug, **values)
        db.add(deal)
        db.flush()
        db.add(DealComponent(deal_id=deal.id, travel_offer_id=offer.id, component_type="FLIGHT", price_pln=offer.price_pln, label="Lot"))
    else:
        for field, value in values.items():
            setattr(deal, field, value)
    db.commit()
    db.refresh(deal)
    return deal


def generate_fresh_deals(db: Session, now: datetime | None = None) -> int:
    checked_at = now or datetime.now(UTC)
    freshness_cutoff = checked_at - timedelta(hours=48)
    stale_deals = db.scalars(
        select(Deal).where(
            Deal.is_visible.is_(True),
            Deal.last_verified_at < freshness_cutoff,
            Deal.expires_at.is_(None) | (Deal.expires_at > checked_at),
        )
    ).all()
    for deal in stale_deals:
        deal.status = "STALE"
        deal.is_visible = False
    offers = db.scalars(
        select(TravelOffer).where(
            TravelOffer.price_pln.is_not(None),
            TravelOffer.last_verified_at >= freshness_cutoff,
            (TravelOffer.expires_at.is_(None) | (TravelOffer.expires_at > checked_at)),
        )
    ).all()
    generated = 0
    for offer in offers:
        if generate_flight_deal(db, offer, checked_at) is not None:
            generated += 1
    db.commit()
    return generated
