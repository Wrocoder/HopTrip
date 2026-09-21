import hashlib
import json
from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal

from app.models.data_provider import DataProvider
from app.models.location import Airport, Destination, DestinationAlias
from app.models.offer import PriceObservation, TravelOffer
from app.providers.base import RawTravelOffer
from app.services.availability import DEAL_FRESHNESS
from app.services.currency import CurrencyConverter
from app.services.time import utc
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


@dataclass
class IngestionResult:
    saved_offers: int = 0
    updated_offers: int = 0
    saved_observations: int = 0
    skipped_unresolved_routes: int = 0
    skipped_unconvertible_prices: int = 0
    skipped_ambiguous_routes: int = 0
    skipped_invalid_offers: int = 0
    duplicate_observations: int = 0
    unresolved_routes: list[str] = field(default_factory=list)
    ambiguous_routes: list[str] = field(default_factory=list)


def resolve_destination(db: Session, provider: str, raw: RawTravelOffer) -> tuple[int | None, bool]:
    # Prefer an explicitly mapped airport. Never silently select one ambiguous match.
    candidates: list[int] = []
    for code in (raw.payload.get("destination_airport"), raw.destination):
        if not code:
            continue
        aliases = set(
            db.scalars(
                select(DestinationAlias.destination_id)
                .join(Destination, Destination.id == DestinationAlias.destination_id)
                .where(
                    Destination.is_active.is_(True),
                    DestinationAlias.provider_code.in_([provider, "*"]),
                    DestinationAlias.code == str(code).upper(),
                )
            )
        )
        if len(aliases) > 1:
            return None, True
        if aliases:
            candidates.extend(aliases)
    if candidates:
        return (candidates[0], False) if len(set(candidates)) == 1 else (None, True)
    legacy = list(
        db.scalars(
            select(Destination.id).where(
                Destination.iata_code == raw.destination.upper(), Destination.is_active.is_(True)
            )
        )
    )
    return (legacy[0], False) if len(legacy) == 1 else (None, len(legacy) > 1)


def observation_key(provider: str, raw: RawTravelOffer) -> str:
    identity = [
        provider,
        raw.external_id,
        str(raw.price.normalize()),
        raw.currency.upper(),
        utc(raw.source_observed_at).isoformat() if raw.source_observed_at else "unknown",
    ]
    return hashlib.sha256(json.dumps(identity).encode()).hexdigest()


def ingest_offers(
    db: Session,
    *,
    provider_code: str,
    offers: list[RawTravelOffer],
    converter: CurrencyConverter,
    now: datetime | None = None,
) -> IngestionResult:
    fetched_at = now or datetime.now(UTC)
    provider = db.scalar(select(DataProvider).where(DataProvider.code == provider_code))
    if provider is None:
        raise ValueError(f"Unknown data provider: {provider_code}")
    result = IngestionResult()
    for raw in offers:
        if (
            not raw.price.is_finite()
            or raw.price <= 0
            or raw.depart_at.tzinfo is None
            or (raw.return_at and (raw.return_at.tzinfo is None or raw.return_at < raw.depart_at))
            or (
                raw.source_observed_at
                and (raw.source_observed_at.tzinfo is None or raw.source_observed_at > fetched_at)
            )
        ):
            result.skipped_invalid_offers += 1
            continue
        origin = db.scalar(
            select(Airport).where(
                Airport.iata_code == raw.origin.upper(), Airport.is_active.is_(True)
            )
        )
        destination_id, ambiguous = resolve_destination(db, provider_code, raw)
        if origin is None or destination_id is None:
            route = f"{raw.origin.upper()[:3]}-{raw.destination.upper()[:3]}"
            diagnostic = result.ambiguous_routes if ambiguous else result.unresolved_routes
            if route not in diagnostic and len(diagnostic) < 100:
                diagnostic.append(route)
            if ambiguous:
                result.skipped_ambiguous_routes += 1
            else:
                result.skipped_unresolved_routes += 1
            continue
        key = observation_key(provider_code, raw)
        conversion = converter.to_pln(raw.price, raw.currency, fetched_at)
        observed = db.scalar(
            select(PriceObservation).where(PriceObservation.observation_key == key)
        )
        # Repeated cached values with no source time retain the first-seen timestamp.
        verified_at = (
            utc(raw.source_observed_at)
            if raw.source_observed_at
            else (utc(observed.observed_at) if observed else fetched_at)
        )
        expiry = (
            min(utc(raw.expires_at), verified_at + DEAL_FRESHNESS)
            if raw.expires_at
            else verified_at + DEAL_FRESHNESS
        )
        query = select(TravelOffer).where(
            TravelOffer.data_provider_id == provider.id, TravelOffer.external_id == raw.external_id
        )
        existing = db.scalar(query.with_for_update())
        values = dict(
            product_type="FLIGHT",
            origin_airport_id=origin.id,
            destination_id=destination_id,
            depart_at=raw.depart_at,
            return_at=raw.return_at,
            original_price=raw.price,
            original_currency=raw.currency.upper(),
            price_pln=conversion[0] if conversion else None,
            exchange_rate=conversion[1] if conversion else None,
            exchange_rate_at=verified_at if conversion else None,
            source=raw.source,
            raw_payload=raw.payload,
            fetched_at=fetched_at,
            last_verified_at=verified_at,
            source_observed_at=raw.source_observed_at,
            observation_key=key,
            departure_precision=raw.departure_precision,
            expires_at=expiry,
        )
        if existing is None:
            try:
                with db.begin_nested():
                    existing = TravelOffer(
                        data_provider_id=provider.id, external_id=raw.external_id, **values
                    )
                    db.add(existing)
                    db.flush()
                result.saved_offers += 1
            except IntegrityError:
                existing = db.scalar(query.with_for_update())
                if existing is None:
                    raise
                result.updated_offers += 1
        else:
            result.updated_offers += 1
        # Re-read after acquiring the row lock: another writer may have just committed.
        observed = db.scalar(
            select(PriceObservation).where(PriceObservation.observation_key == key)
        )
        if not raw.source_observed_at and (observed or existing.observation_key == key):
            verified_at = utc(observed.observed_at) if observed else utc(existing.last_verified_at)
            values["last_verified_at"] = verified_at
            values["exchange_rate_at"] = verified_at if conversion else None
            values["expires_at"] = (
                min(utc(raw.expires_at), verified_at + DEAL_FRESHNESS)
                if raw.expires_at
                else verified_at + DEAL_FRESHNESS
            )
        # Late delivery of an older observation must not replace a newer price.
        if utc(existing.last_verified_at) <= verified_at:
            for field, value in values.items():
                setattr(existing, field, value)
        else:
            existing.fetched_at = fetched_at
        db.flush()
        if not conversion:
            result.skipped_unconvertible_prices += 1
            continue
        if observed:
            result.duplicate_observations += 1
            continue
        try:
            with db.begin_nested():
                db.add(
                    PriceObservation(
                        observation_key=key,
                        data_provider_id=provider.id,
                        origin_airport_id=origin.id,
                        destination_id=destination_id,
                        product_type="FLIGHT",
                        departure_date=raw.depart_at.date(),
                        trip_duration_days=(raw.return_at.date() - raw.depart_at.date()).days
                        if raw.return_at
                        else None,
                        observed_price_pln=Decimal(conversion[0]),
                        original_price=raw.price,
                        original_currency=raw.currency.upper(),
                        source=raw.source,
                        observed_at=verified_at,
                    )
                )
                db.flush()
            result.saved_observations += 1
        except IntegrityError:
            if not db.scalar(
                select(PriceObservation.id).where(PriceObservation.observation_key == key)
            ):
                raise
            result.duplicate_observations += 1
    db.commit()
    return result
