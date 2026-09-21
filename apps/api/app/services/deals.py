from datetime import UTC, datetime
from decimal import Decimal

from app.models.deal import Deal, DealComponent
from app.models.offer import TravelOffer
from app.models.statistics import RouteStatistics
from app.services.availability import DEAL_FRESHNESS
from app.services.scoring import score_flight_deal
from app.services.time import utc
from sqlalchemy import select
from sqlalchemy.orm import Session


def generate_flight_deal(
    db: Session, offer: TravelOffer, now: datetime | None = None
) -> Deal | None:
    if (
        offer.product_type != "FLIGHT"
        or offer.price_pln is None
        or offer.origin_airport_id is None
        or offer.destination_id is None
    ):
        return None
    checked_at = now or datetime.now(UTC)
    if utc(offer.depart_at) <= checked_at:
        return None
    duration = (offer.return_at.date() - offer.depart_at.date()).days if offer.return_at else None
    stats = db.scalar(
        select(RouteStatistics).where(
            RouteStatistics.data_provider_id == offer.data_provider_id,
            RouteStatistics.origin_airport_id == offer.origin_airport_id,
            RouteStatistics.destination_id == offer.destination_id,
            RouteStatistics.product_type == offer.product_type,
            RouteStatistics.departure_month == offer.depart_at.strftime("%Y-%m"),
            RouteStatistics.trip_duration_days == duration,
        )
    )
    score = score_flight_deal(
        current_price=Decimal(offer.price_pln),
        baseline_price=stats.median_price_pln if stats else None,
        p25_price=stats.p25_price_pln if stats else None,
        p75_price=stats.p75_price_pln if stats else None,
        confidence=stats.confidence if stats else Decimal(0),
        expires_at=utc(offer.expires_at) if offer.expires_at else None,
        now=checked_at,
    )
    trip_end = offer.return_at.date() if offer.return_at else offer.depart_at.date()
    slug = f"flight-{offer.id}-{offer.depart_at:%Y-%m-%d}"
    deal = db.scalar(select(Deal).where(Deal.slug == slug))
    values = {
        "origin_airport_id": offer.origin_airport_id,
        "depart_at": offer.depart_at,
        "score_version": "flight-v2",
        "score_components": {
            "sample_count": stats.sample_count if stats else 0,
            "flight_price": score.flight_price_score,
            "historical_discount": score.historical_discount_score,
            "convenience": score.convenience_score,
            "freshness": score.freshness_score,
            "confidence": score.confidence_score,
        },
        "explanation_codes": score.explanation,
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
        "status": "ACTIVE"
        if not offer.expires_at or utc(offer.expires_at) > checked_at
        else "EXPIRED",
        "explanation": [],
        "last_verified_at": offer.last_verified_at,
        "expires_at": offer.expires_at,
    }
    if deal is None:
        deal = Deal(slug=slug, **values)
        db.add(deal)
        db.flush()
    else:
        for field, value in values.items():
            setattr(deal, field, value)
    component = db.scalar(
        select(DealComponent).where(
            DealComponent.deal_id == deal.id,
            DealComponent.component_type == "FLIGHT",
        )
    )
    if component is None:
        component = DealComponent(deal_id=deal.id, component_type="FLIGHT", label="Lot")
        db.add(component)
    component.travel_offer_id = offer.id
    component.price_pln = offer.price_pln
    db.commit()
    db.refresh(deal)
    return deal


def generate_fresh_deals(db: Session, now: datetime | None = None) -> int:
    checked_at = now or datetime.now(UTC)
    freshness_cutoff = checked_at - DEAL_FRESHNESS
    expire_deals(db, checked_at)
    offers = db.scalars(
        select(TravelOffer).where(
            TravelOffer.price_pln.is_not(None),
            TravelOffer.product_type == "FLIGHT",
            TravelOffer.depart_at > checked_at,
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


def expire_deals(db: Session, now: datetime | None = None) -> int:
    checked = now or datetime.now(UTC)
    count = 0
    for deal in db.scalars(select(Deal).where(Deal.status == "ACTIVE")):
        departed = (
            utc(deal.depart_at) <= checked if deal.depart_at else deal.trip_start <= checked.date()
        )
        expired = deal.expires_at is not None and utc(deal.expires_at) <= checked
        stale = utc(deal.last_verified_at) < checked - DEAL_FRESHNESS
        if departed or expired or stale:
            deal.status = "EXPIRED" if departed or expired else "STALE"
            count += 1
    db.commit()
    return count
