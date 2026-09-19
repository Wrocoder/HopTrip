from collections import defaultdict
from datetime import UTC, datetime
from decimal import ROUND_HALF_UP, Decimal

from app.models.offer import PriceObservation
from app.models.statistics import RouteStatistics
from sqlalchemy import select
from sqlalchemy.orm import Session


def recalculate_route_statistics(
    db: Session,
    *,
    data_provider_id: int | None = None,
    now: datetime | None = None,
) -> int:
    query = select(PriceObservation).where(PriceObservation.observed_price_pln.is_not(None))
    if data_provider_id is not None:
        query = query.where(PriceObservation.data_provider_id == data_provider_id)
    observations = db.scalars(query).all()
    grouped: dict[tuple, list[Decimal]] = defaultdict(list)
    for observation in observations:
        key = (
            observation.data_provider_id,
            observation.origin_airport_id,
            observation.destination_id,
            observation.product_type,
            observation.departure_date.strftime("%Y-%m"),
            observation.trip_duration_days,
        )
        grouped[key].append(Decimal(observation.observed_price_pln))

    calculated_at = now or datetime.now(UTC)
    changed = 0
    for key, prices in grouped.items():
        ordered = sorted(prices)
        statistics = _calculate(ordered)
        existing = db.scalar(
            select(RouteStatistics).where(
                RouteStatistics.data_provider_id == key[0],
                RouteStatistics.origin_airport_id == key[1],
                RouteStatistics.destination_id == key[2],
                RouteStatistics.product_type == key[3],
                RouteStatistics.departure_month == key[4],
                RouteStatistics.trip_duration_days == key[5],
            )
        )
        if existing is None:
            existing = RouteStatistics(
                data_provider_id=key[0],
                origin_airport_id=key[1],
                destination_id=key[2],
                product_type=key[3],
                departure_month=key[4],
                trip_duration_days=key[5],
            )
            db.add(existing)
        for field, value in statistics.items():
            setattr(existing, field, value)
        existing.calculated_at = calculated_at
        changed += 1

    db.commit()
    return changed


def _calculate(prices: list[Decimal]) -> dict[str, Decimal | int]:
    return {
        "sample_count": len(prices),
        "min_price_pln": prices[0],
        "p25_price_pln": _percentile(prices, 0.25),
        "median_price_pln": _percentile(prices, 0.50),
        "p75_price_pln": _percentile(prices, 0.75),
        "max_price_pln": prices[-1],
        "confidence": (Decimal(min(len(prices), 30)) / Decimal(30)).quantize(
            Decimal("0.0001"), rounding=ROUND_HALF_UP
        ),
    }


def _percentile(values: list[Decimal], percentile: Decimal | float) -> Decimal:
    if len(values) == 1:
        return values[0]
    position = (len(values) - 1) * Decimal(str(percentile))
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    fraction = position - lower
    return (values[lower] + (values[upper] - values[lower]) * fraction).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
