"""Observation, delivery and catalogue lifetime are separate facts."""
from datetime import UTC, datetime, time
from typing import Literal

from app.models.deal import Deal
from app.models.offer import TravelOffer
from app.schemas.deal import PriceFreshness
from app.services.price_lifetime import max_price_age_hours, price_deadline
from app.services.score_explanation import explain_score
from app.services.time import utc


def price_freshness(deal: Deal, offer: TravelOffer | None = None, now: datetime | None = None) -> PriceFreshness:
    checked = utc(now or datetime.now(UTC))
    departure = utc(deal.depart_at) if deal.depart_at else datetime.combine(deal.trip_start, time.min, UTC)
    observed = utc(deal.last_verified_at)
    deadlines = [price_deadline(observed, departure)]
    max_age = max_price_age_hours(departure, checked)
    if deal.expires_at:
        deadlines.append(utc(deal.expires_at))
    deadlines.append(utc(deal.depart_at) if deal.depart_at else datetime.combine(deal.trip_start, time.min, UTC))
    basis: Literal["SOURCE", "FIRST_SEEN"] | None = None
    score = explain_score(deal)
    if (score.observed_at and utc(score.observed_at) == observed
            and score.current_price_pln == deal.flight_price_pln):
        basis = score.observation_basis
    if offer:
        basis = None
        deadlines.append(price_deadline(offer.last_verified_at, offer.depart_at))
        max_age = min(max_age, max_price_age_hours(offer.depart_at, checked))
        if offer.expires_at:
            deadlines.append(utc(offer.expires_at))
        deadlines.append(utc(offer.depart_at))
        if utc(offer.last_verified_at) == observed and offer.price_pln == deal.flight_price_pln:
            basis = "SOURCE" if offer.source_observed_at else "FIRST_SEEN"
    return PriceFreshness(observed_at=observed, observation_basis=basis,
                          fetched_at=utc(offer.fetched_at) if offer else None,
                          hidden_after=min(deadlines), max_age_hours=max_age)
