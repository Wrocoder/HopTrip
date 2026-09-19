from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.services.scoring import score_flight_deal


def test_scoring_explains_price_advantage() -> None:
    score = score_flight_deal(
        current_price=Decimal(180),
        baseline_price=Decimal(400),
        p25_price=Decimal(250),
        p75_price=Decimal(500),
        confidence=Decimal("0.8"),
        expires_at=datetime.now(UTC) + timedelta(days=2),
    )
    assert score.deal_score >= 70
    assert score.discount_percent == Decimal("55.00")
    assert any("tańszy" in item for item in score.explanation)


def test_expired_offer_has_zero_freshness() -> None:
    now = datetime(2026, 9, 19, tzinfo=UTC)
    score = score_flight_deal(
        current_price=Decimal(180),
        baseline_price=Decimal(400),
        p25_price=Decimal(250),
        p75_price=Decimal(500),
        confidence=Decimal("0.8"),
        expires_at=now - timedelta(minutes=1),
        now=now,
    )
    assert score.freshness_score == 0

