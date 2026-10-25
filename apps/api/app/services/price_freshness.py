"""Observation, delivery and catalogue lifetime are separate facts."""
from datetime import UTC, datetime, time
from typing import Literal

from app.models.deal import Deal
from app.models.offer import TravelOffer
from app.schemas.deal import PriceFreshness
from app.services.availability import DEAL_FRESHNESS
from app.services.score_explanation import explain_score
from app.services.time import utc


def price_freshness(deal: Deal, offer: TravelOffer | None = None) -> PriceFreshness:
    observed = utc(deal.last_verified_at)
    deadlines = [observed + DEAL_FRESHNESS]
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
        deadlines.append(utc(offer.last_verified_at) + DEAL_FRESHNESS)
        if offer.expires_at:
            deadlines.append(utc(offer.expires_at))
        deadlines.append(utc(offer.depart_at))
        if utc(offer.last_verified_at) == observed and offer.price_pln == deal.flight_price_pln:
            basis = "SOURCE" if offer.source_observed_at else "FIRST_SEEN"
    return PriceFreshness(observed_at=observed, observation_basis=basis,
                          fetched_at=utc(offer.fetched_at) if offer else None,
                          hidden_after=min(deadlines), max_age_hours=int(DEAL_FRESHNESS.total_seconds() / 3600))
