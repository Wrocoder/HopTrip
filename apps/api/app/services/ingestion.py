from dataclasses import dataclass
from datetime import UTC, datetime

from app.models.data_provider import DataProvider
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation, TravelOffer
from app.providers.base import RawTravelOffer
from app.services.currency import CurrencyConverter
from sqlalchemy import select
from sqlalchemy.orm import Session


@dataclass(frozen=True)
class IngestionResult:
    saved_offers: int = 0
    updated_offers: int = 0
    saved_observations: int = 0
    skipped_unresolved_routes: int = 0
    skipped_unconvertible_prices: int = 0


def ingest_offers(
    db: Session,
    *,
    provider_code: str,
    offers: list[RawTravelOffer],
    converter: CurrencyConverter,
    now: datetime | None = None,
) -> IngestionResult:
    """Persist normalized provider results without inventing missing route or currency data."""
    observed_at = now or datetime.now(UTC)
    provider = db.scalar(select(DataProvider).where(DataProvider.code == provider_code))
    if provider is None:
        raise ValueError(f"Unknown data provider: {provider_code}")

    result = IngestionResult()
    for raw in offers:
        origin = db.scalar(select(Airport).where(Airport.iata_code == raw.origin.upper()))
        destination = db.scalar(
            select(Destination).where(Destination.iata_code == raw.destination.upper())
        )
        if origin is None or destination is None:
            result = _increment(result, "skipped_unresolved_routes")
            continue

        conversion = converter.to_pln(raw.price, raw.currency, observed_at)
        price_pln = conversion[0] if conversion else None
        exchange_rate = conversion[1] if conversion else None
        existing = db.scalar(
            select(TravelOffer).where(
                TravelOffer.data_provider_id == provider.id,
                TravelOffer.external_id == raw.external_id,
            )
        )
        if existing is None:
            existing = TravelOffer(
                data_provider_id=provider.id,
                external_id=raw.external_id,
                product_type="FLIGHT",
                origin_airport_id=origin.id,
                destination_id=destination.id,
                depart_at=raw.depart_at,
                return_at=raw.return_at,
                original_price=raw.price,
                original_currency=raw.currency.upper(),
                price_pln=price_pln,
                exchange_rate=exchange_rate,
                exchange_rate_at=observed_at if conversion else None,
                source=raw.source,
                raw_payload=raw.payload,
                fetched_at=observed_at,
                last_verified_at=observed_at,
                expires_at=raw.expires_at,
            )
            db.add(existing)
            result = _increment(result, "saved_offers")
        else:
            existing.original_price = raw.price
            existing.original_currency = raw.currency.upper()
            existing.price_pln = price_pln
            existing.exchange_rate = exchange_rate
            existing.exchange_rate_at = observed_at if conversion else None
            existing.depart_at = raw.depart_at
            existing.return_at = raw.return_at
            existing.raw_payload = raw.payload
            existing.last_verified_at = observed_at
            existing.expires_at = raw.expires_at
            result = _increment(result, "updated_offers")

        if conversion:
            db.add(
                PriceObservation(
                    data_provider_id=provider.id,
                    origin_airport_id=origin.id,
                    destination_id=destination.id,
                    product_type="FLIGHT",
                    departure_date=raw.depart_at.date(),
                    trip_duration_days=(raw.return_at.date() - raw.depart_at.date()).days
                    if raw.return_at
                    else None,
                    observed_price_pln=price_pln,
                    original_price=raw.price,
                    original_currency=raw.currency.upper(),
                    source=raw.source,
                    observed_at=observed_at,
                )
            )
            result = _increment(result, "saved_observations")
        else:
            result = _increment(result, "skipped_unconvertible_prices")

    db.commit()
    return result


def _increment(result: IngestionResult, field: str) -> IngestionResult:
    values = result.__dict__.copy()
    values[field] += 1
    return IngestionResult(**values)
