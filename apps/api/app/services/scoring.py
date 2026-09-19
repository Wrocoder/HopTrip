from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class ScoringWeights:
    flight_price: Decimal = Decimal("0.35")
    historical_discount: Decimal = Decimal("0.20")
    convenience: Decimal = Decimal("0.15")
    freshness: Decimal = Decimal("0.15")
    confidence: Decimal = Decimal("0.15")


DEFAULT_WEIGHTS = ScoringWeights()


@dataclass(frozen=True)
class DealScore:
    flight_price_score: int
    historical_discount_score: int
    convenience_score: int
    freshness_score: int
    confidence_score: int
    deal_score: int
    discount_percent: Decimal
    explanation: list[str]


def score_flight_deal(
    *,
    current_price: Decimal,
    baseline_price: Decimal | None,
    p25_price: Decimal | None,
    p75_price: Decimal | None,
    confidence: Decimal,
    expires_at: datetime | None,
    now: datetime | None = None,
    convenience_score: int = 100,
    weights: ScoringWeights = DEFAULT_WEIGHTS,
) -> DealScore:
    checked_at = now or datetime.now(UTC)
    discount = _discount(current_price, baseline_price)
    flight_score = _range_score(current_price, p25_price, p75_price)
    discount_score = _clamp_int(discount)
    freshness_score = _freshness(expires_at, checked_at)
    confidence_score = _clamp_int(confidence * 100)
    final = round(
        float(
            Decimal(flight_score) * weights.flight_price
            + Decimal(discount_score) * weights.historical_discount
            + Decimal(convenience_score) * weights.convenience
            + Decimal(freshness_score) * weights.freshness
            + Decimal(confidence_score) * weights.confidence
        )
    )
    explanation = []
    if discount > 0:
        explanation.append(f"Lot jest o {discount.quantize(Decimal(1), rounding=ROUND_HALF_UP)}% tańszy niż mediana.")
    if confidence_score >= 67:
        explanation.append("Porównanie opiera się na wystarczającej liczbie obserwacji.")
    elif confidence_score > 0:
        explanation.append("Historia ceny jest jeszcze krótka — traktuj porównanie jako orientacyjne.")
    if expires_at and expires_at > checked_at:
        explanation.append("Cena ma aktywny termin ważności u źródła danych.")
    return DealScore(
        flight_price_score=flight_score,
        historical_discount_score=discount_score,
        convenience_score=_clamp_int(convenience_score),
        freshness_score=freshness_score,
        confidence_score=confidence_score,
        deal_score=_clamp_int(final),
        discount_percent=discount,
        explanation=explanation,
    )


def _discount(current: Decimal, baseline: Decimal | None) -> Decimal:
    if not baseline or baseline <= 0:
        return Decimal(0)
    return max(Decimal(0), (baseline - current) / baseline * 100).quantize(Decimal("0.01"))


def _range_score(current: Decimal, p25: Decimal | None, p75: Decimal | None) -> int:
    if p25 is None or p75 is None or p75 <= p25:
        return 50
    return _clamp_int((p75 - current) / (p75 - p25) * 100)


def _freshness(expires_at: datetime | None, now: datetime) -> int:
    if expires_at is None:
        return 50
    seconds = (expires_at - now).total_seconds()
    if seconds <= 0:
        return 0
    if seconds >= 24 * 3600:
        return 100
    return _clamp_int(Decimal(str(seconds / 86400)) * 100)


def _clamp_int(value: Decimal | float) -> int:
    return max(0, min(100, int(Decimal(str(value)).quantize(Decimal(1), rounding=ROUND_HALF_UP))))
