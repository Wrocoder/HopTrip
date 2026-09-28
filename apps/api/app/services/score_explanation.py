"""Explain the stored score without applying a different formula at read time."""

from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

from app.models.deal import Deal
from app.schemas.score import ScoreExplanation, ScorePart
from app.services.scoring import MAX_POINTS, SCORE_VERSION
from pydantic import ValidationError

LEGACY_WEIGHTS = {
    "flight_price": 35,
    "historical_discount": 20,
    "convenience": 15,
    "freshness": 15,
    "confidence": 15,
}


def explain_score(deal: Deal) -> ScoreExplanation:
    data = deal.score_components or {}
    if deal.score_version == SCORE_VERSION:
        try:
            result = ScoreExplanation.model_validate(data.get("breakdown"))
            total = sum((part.points for part in result.parts), Decimal(0))
            if (
                result.status in {"CURRENT", "PROVISIONAL"}
                and len(result.parts) == len(MAX_POINTS)
                and {part.key: part.max_points for part in result.parts} == MAX_POINTS
                and all(part.points <= part.max_points for part in result.parts)
                and total == result.total_before_rounding
                and int(total.quantize(Decimal(1), rounding=ROUND_HALF_UP)) == deal.deal_score
            ):
                return result
        except (ValidationError, InvalidOperation, ValueError):
            pass
    elif deal.score_version == "flight-v2":
        try:
            parts = []
            for key, maximum in LEGACY_WEIGHTS.items():
                value = Decimal(str(data[key]))
                if not value.is_finite() or not 0 <= value <= 100:
                    return ScoreExplanation()
                parts.append(ScorePart(key=key, points=value * maximum / 100, max_points=maximum))
            total = sum((part.points for part in parts), Decimal(0))
            # v2 used Python's round(float), including ties-to-even.
            if round(float(total)) == deal.deal_score:
                return ScoreExplanation(
                    status="LEGACY",
                    parts=parts,
                    total_before_rounding=total,
                    sample_count=data.get("sample_count"),
                    current_price_pln=deal.flight_price_pln,
                    median_price_pln=deal.historical_baseline_pln,
                )
        except (KeyError, TypeError, ValueError, InvalidOperation):
            pass
    return ScoreExplanation()
