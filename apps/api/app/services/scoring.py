"""A reproducible opportunity index; it does not rate airlines or booking probability."""

from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import ROUND_HALF_UP, Decimal

from app.schemas.score import ScoreExplanation, ScorePart
from app.services.availability import DEAL_FRESHNESS
from app.services.time import utc

SCORE_VERSION = "flight-v3"
MIN_PRICE_SAMPLES = 5
FULL_HISTORY_SAMPLES = 30
MAX_POINTS = {"price": 60, "history": 25, "freshness": 15}


@dataclass(frozen=True)
class DealScore:
    deal_score: int
    discount_percent: Decimal
    explanation: list[str]
    breakdown: ScoreExplanation


def score_flight_deal(
    *,
    current_price: Decimal,
    baseline_price: Decimal | None,
    sample_count: int,
    observed_at: datetime | None,
    expires_at: datetime | None,
    source_observed_at: datetime | None = None,
    now: datetime | None = None,
) -> DealScore:
    checked_at = utc(now or datetime.now(UTC))
    if not current_price.is_finite() or current_price <= 0:
        raise ValueError("Scoring requires a positive finite price")
    baseline_valid = (
        baseline_price is not None and baseline_price.is_finite() and baseline_price > 0
    )
    sample_count = max(0, sample_count) if baseline_valid else 0
    sufficient = baseline_valid and sample_count >= MIN_PRICE_SAMPLES
    # Signed difference: above-median prices must score lower, not the same.
    difference = (
        (baseline_price - current_price) / baseline_price * 100
        if baseline_valid and baseline_price is not None
        else None
    )
    price_score = (
        _clamp(Decimal(50) + difference)
        if sufficient and difference is not None else Decimal(50)
    )
    history_score = Decimal(min(sample_count, FULL_HISTORY_SAMPLES)) / FULL_HISTORY_SAMPLES * 100
    observed = utc(observed_at) if observed_at else None
    age = Decimal(str((checked_at - observed).total_seconds())) if observed else None
    freshness_score = Decimal(0)
    if age is not None and age >= 0 and (not expires_at or utc(expires_at) > checked_at):
        freshness_score = _clamp((1 - age / Decimal(str(DEAL_FRESHNESS.total_seconds()))) * 100)
    scores = {"price": price_score, "history": history_score, "freshness": freshness_score}
    parts = [
        ScorePart(
            key=key,
            points=(value * MAX_POINTS[key] / 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP),
            max_points=MAX_POINTS[key],
        )
        for key, value in scores.items()
    ]
    total = sum((part.points for part in parts), Decimal(0))
    codes = ["CACHED_PRICE", "HISTORY_AVAILABLE" if sufficient else "LIMITED_HISTORY"]
    if sufficient and difference is not None and difference > 0:
        codes.append("BELOW_MEDIAN")
    breakdown = ScoreExplanation(
        status="CURRENT" if sufficient else "PROVISIONAL",
        parts=parts,
        total_before_rounding=total,
        sample_count=sample_count,
        current_price_pln=current_price,
        median_price_pln=baseline_price if baseline_valid else None,
        price_difference_percent=difference.quantize(Decimal("0.01")) if difference is not None else None,
        observed_at=observed,
        calculated_at=checked_at,
        observation_basis="SOURCE" if source_observed_at else "FIRST_SEEN",
    )
    return DealScore(
        deal_score=int(total.quantize(Decimal(1), rounding=ROUND_HALF_UP)),
        discount_percent=max(Decimal(0), difference or Decimal(0)).quantize(Decimal("0.01")),
        explanation=codes,
        breakdown=breakdown,
    )


def _clamp(value: Decimal) -> Decimal:
    return max(Decimal(0), min(Decimal(100), value))
