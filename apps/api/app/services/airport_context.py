"""Offline, bounded editorial metadata; never derive transfers from distance."""
import json
import re
from datetime import UTC, date, datetime, time
from functools import lru_cache
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.schemas.airport_context import AirportCityContext, AirportCityRecord, AirportContext
from app.schemas.deal import FlightFacts
from pydantic import ValidationError

REGISTRY_PATH = Path(__file__).resolve().parents[1] / "data/airport-city-context.json"


@lru_cache(maxsize=1)
def registry() -> dict[tuple[str, str], AirportCityRecord]:
    try:
        raw = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    if not isinstance(raw, dict) or raw.get("version") != "airport-city-registry-v1" or not isinstance(raw.get("records"), list):
        return {}
    result = {}
    duplicates = set()
    for row in raw["records"]:
        try:
            record = AirportCityRecord.model_validate(row)
        except ValidationError:
            continue
        if record.source.scheme != "https" or record.source.username or record.source.password:
            continue
        key = (record.airport, record.destination_slug)
        if key in result:
            duplicates.add(key)
        result[key] = record
    return {k: v for k, v in result.items() if k not in duplicates}


def city_context(code: str | None, slug: str, as_of: date) -> AirportCityContext:
    code = code if code and re.fullmatch(r"[A-Z]{3}", code) else None
    result = AirportCityContext(airport=code, destination_slug=slug)
    record = registry().get((code, slug)) if code else None
    if not record:
        return result
    result.target_city, result.source = record.target_city, record.source
    result.last_verified_at = record.last_verified_at
    age = (as_of - record.last_verified_at).days
    if not 0 <= age <= 180:
        result.status = "STALE"
        return result
    result.status = "KNOWN"
    result.distance_km, result.distance_basis = record.distance_km, record.distance_basis
    result.remote = record.distance_km >= 40
    return result


def local_clock(value: datetime | None, zone: str | None) -> time | None:
    if value is None or value.utcoffset() is None or not zone:
        return None
    try:
        return value.astimezone(ZoneInfo(zone)).time()
    except (ZoneInfoNotFoundError, ValueError, OverflowError):
        return None


def airport_context(facts: FlightFacts, *, destination_slug: str, round_trip: bool,
                    itinerary_eligible: bool, as_of: date | None = None) -> AirportContext:
    result = AirportContext()
    if not itinerary_eligible:
        result.warnings.append("UNVERIFIED_ITINERARY")
        return result
    result.itinerary_verified = True
    today = as_of if as_of is not None else datetime.now(UTC).date()
    result.arrival = city_context(facts.destination_airport, destination_slug, today)
    if round_trip:
        result.return_departure = city_context(facts.return_origin_airport, destination_slug, today)
        if facts.destination_airport and facts.return_origin_airport:
            result.different_destination_airports = facts.destination_airport != facts.return_origin_airport
            if result.different_destination_airports:
                result.warnings.append("DIFFERENT_DESTINATION_AIRPORTS")
        if facts.origin_airport and facts.return_destination_airport:
            result.different_home_airports = facts.origin_airport != facts.return_destination_airport
            if result.different_home_airports:
                result.warnings.append("DIFFERENT_HOME_AIRPORTS")
    if result.arrival.remote:
        result.warnings.append("REMOTE_ARRIVAL_AIRPORT")
    if result.return_departure and result.return_departure.remote:
        result.warnings.append("REMOTE_RETURN_AIRPORT")
    if result.arrival.status == "UNKNOWN":
        result.warnings.append("ARRIVAL_METADATA_UNKNOWN")
    if result.return_departure and result.return_departure.status == "UNKNOWN":
        result.warnings.append("RETURN_METADATA_UNKNOWN")
    if any(c and c.status == "STALE" for c in (result.arrival, result.return_departure)):
        result.warnings.append("STALE_AIRPORT_METADATA")
    result.arrival_local_time = local_clock(facts.outbound_arrival, facts.destination_timezone)
    result.arrival_time_estimated = facts.outbound_arrival_calculated and result.arrival_local_time is not None
    if result.arrival_local_time is None:
        result.warnings.append("ARRIVAL_TIME_UNKNOWN")
    elif result.arrival_local_time >= time(22):
        result.warnings.append("LATE_ARRIVAL")
    elif result.arrival_local_time < time(6):
        result.warnings.append("EARLY_ARRIVAL")
    if round_trip:
        result.return_departure_local_time = local_clock(facts.return_departure, facts.return_origin_timezone)
        if result.return_departure_local_time is None:
            result.warnings.append("RETURN_DEPARTURE_TIME_UNKNOWN")
        elif result.return_departure_local_time < time(8):
            result.warnings.append("EARLY_RETURN_DEPARTURE")
    result.warnings.append("TRANSFER_TIME_UNKNOWN")
    return result
