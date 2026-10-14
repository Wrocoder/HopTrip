"""Public, allowlisted facts from the currently supported cached-price source."""

import re
from datetime import UTC, datetime, timedelta

from app.models.offer import TravelOffer
from app.schemas.deal import FlightFacts
from app.services.flight_reference import airline_name, airport_timezone


def _code(value: object, pattern: str = r"[A-Z]{3}") -> str | None:
    return value if isinstance(value, str) and re.fullmatch(pattern, value) else None


def _count(value: object, maximum: int) -> int | None:
    # bool is an int in Python, but not a valid count in a provider payload.
    return value if type(value) is int and 0 <= value <= maximum else None


def _time(value: object) -> datetime | None:
    if not isinstance(value, str) or "T" not in value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo is not None else None
    except ValueError:
        return None


def _arrival(departure: datetime | None, duration: object) -> datetime | None:
    minutes = _count(duration, 7 * 24 * 60)
    if departure is None or not minutes:
        return None
    try:
        # Elapsed duration, never wall-clock arithmetic across a DST transition.
        return departure.astimezone(UTC) + timedelta(minutes=minutes)
    except OverflowError:
        return None


def flight_facts(offer: TravelOffer) -> FlightFacts:
    facts = FlightFacts()
    if offer.source != "travelpayouts_data" or offer.product_type != "FLIGHT":
        return facts
    payload = offer.raw_payload or {}
    facts.origin_airport = _code(payload.get("origin_airport"))
    facts.destination_airport = _code(payload.get("destination_airport"))
    facts.destination_code = _code(payload.get("destination"))
    facts.airline_code = _code(payload.get("airline"), r"[A-Z0-9]{2}")
    facts.airline_name = airline_name(facts.airline_code)
    facts.origin_timezone = airport_timezone(facts.origin_airport)
    facts.destination_timezone = airport_timezone(facts.destination_airport)
    facts.outbound_stops = _count(payload.get("transfers"), 20)
    if offer.departure_precision == "TIME":
        facts.outbound_departure = _time(payload.get("departure_at"))
    facts.outbound_arrival = _arrival(facts.outbound_departure, payload.get("duration_to"))
    facts.outbound_arrival_calculated = facts.outbound_arrival is not None
    if offer.return_at is not None:
        facts.return_stops = _count(payload.get("return_transfers"), 20)
        facts.return_departure = _time(payload.get("return_at"))
        facts.return_arrival = _arrival(facts.return_departure, payload.get("duration_back"))
        facts.return_arrival_calculated = facts.return_arrival is not None
        if facts.outbound_arrival and facts.return_departure:
            interval = (
                facts.return_departure.astimezone(UTC) - facts.outbound_arrival
            ).total_seconds()
            if interval >= 0:
                facts.destination_interval_minutes = int(interval // 60)
    return facts
