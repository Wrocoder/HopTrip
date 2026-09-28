from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from app.models.deal import Deal
from app.services.score_explanation import explain_score
from app.services.scoring import SCORE_VERSION, score_flight_deal

NOW = datetime(2026, 9, 27, 12, tzinfo=UTC)


def calculate(**overrides):
    values = dict(
        current_price=Decimal(330), baseline_price=Decimal(400), sample_count=24,
        observed_at=NOW - timedelta(hours=24), expires_at=None, now=NOW,
    )
    values.update(overrides)
    return score_flight_deal(**values)


def points(score):
    return {part.key: part.points for part in score.breakdown.parts}


def test_scoring_explains_price_advantage() -> None:
    score = calculate()
    assert score.deal_score == 68
    assert points(score) == {"price": Decimal("40.5"), "history": 20, "freshness": Decimal("7.5")}
    assert score.breakdown.total_before_rounding == 68
    assert score.discount_percent == Decimal("17.50")
    assert "BELOW_MEDIAN" in score.explanation
    assert score.breakdown.observation_basis == "FIRST_SEEN"


def test_expired_offer_has_zero_freshness() -> None:
    assert points(calculate(expires_at=NOW))["freshness"] == 0


@pytest.mark.parametrize("hours,expected", [(0, 15), (12, "11.3"), (24, "7.5"), (48, 0), (72, 0), (-1, 0)])
def test_freshness_tracks_observation_age_not_expiry(hours, expected):
    score = calculate(observed_at=NOW - timedelta(hours=hours), expires_at=NOW + timedelta(days=7))
    assert points(score)["freshness"] == Decimal(expected)


def test_missing_timestamp_is_not_assumed_fresh_and_source_time_is_labelled():
    assert points(calculate(observed_at=None))["freshness"] == 0
    assert calculate(source_observed_at=NOW).breakdown.observation_basis == "SOURCE"


@pytest.mark.parametrize("baseline,count", [(None, 0), (Decimal(0), 30), (Decimal(400), 4)])
def test_missing_or_small_history_is_explicitly_provisional(baseline, count):
    score = calculate(baseline_price=baseline, sample_count=count, current_price=Decimal(1))
    assert score.breakdown.status == "PROVISIONAL"
    assert points(score)["price"] == 30
    assert "BELOW_MEDIAN" not in score.explanation
    assert "LIMITED_HISTORY" in score.explanation


def test_price_monotonicity_and_limits():
    scores = [calculate(current_price=Decimal(p)) for p in [1, 200, 300, 400, 500, 600, 900]]
    assert [points(s)["price"] for s in scores] == [60, 60, 45, 30, 15, 0, 0]
    assert all(0 <= s.deal_score <= 100 for s in scores)
    assert scores[-1].breakdown.price_difference_percent < 0
    assert points(calculate(sample_count=300))["history"] == 25
    assert calculate(sample_count=5).breakdown.status == "CURRENT"


def test_rounding_and_snapshot_explanation_reproduce_exact_score():
    score = calculate(current_price=Decimal(400))
    assert score.breakdown.total_before_rounding == Decimal("57.5")
    assert score.deal_score == 58
    deal = Deal(deal_score=score.deal_score, score_version=SCORE_VERSION,
                score_components={"breakdown": score.breakdown.model_dump(mode="json")})
    assert explain_score(deal) == score.breakdown
    deal.deal_score += 1
    assert explain_score(deal).status == "UNAVAILABLE"


def test_legacy_68_is_explained_with_legacy_weights_only():
    deal = Deal(deal_score=68, score_version="flight-v2", score_components={
        "flight_price": 100, "historical_discount": 40, "convenience": 50,
        "freshness": 50, "confidence": 67, "sample_count": 20,
    })
    explained = explain_score(deal)
    assert explained.status == "LEGACY"
    assert explained.total_before_rounding == Decimal("68.05")
    assert [p.points for p in explained.parts] == [35, 8, Decimal("7.5"), Decimal("7.5"), Decimal("10.05")]


@pytest.mark.parametrize("version,data", [
    ("flight-v2", {}), ("flight-v3", {}), ("future", {}),
    ("flight-v3", {"breakdown": {"parts": [{"key": "price", "points": "NaN", "max_points": 60}]}}),
])
def test_missing_invalid_or_unknown_breakdowns_are_not_invented(version, data):
    assert explain_score(Deal(deal_score=68, score_version=version, score_components=data)).status == "UNAVAILABLE"


@pytest.mark.parametrize("price", ["0", "-1", "NaN", "Infinity"])
def test_invalid_price_is_rejected(price):
    with pytest.raises(ValueError):
        calculate(current_price=Decimal(price))
