"""Reuse the itinerary UTC clock, with explicit source/zone/estimation gates."""
import re

from app.schemas.deal import FlightFacts
from app.schemas.destination_time import DestinationTime
from app.services.trip_timeline import elapsed, local_date


def destination_time(facts: FlightFacts, *, itinerary_eligible: bool) -> DestinationTime:
    result = DestinationTime()
    if not itinerary_eligible:
        result.reason = "UNVERIFIED_ITINERARY"
        return result
    if not all(value and re.fullmatch(r"[A-Z]{3}", value)
               for value in (facts.destination_airport, facts.return_origin_airport)):
        result.reason = "MISSING_AIRPORTS"
        return result
    start, end = facts.outbound_arrival, facts.return_departure
    minutes = elapsed(start, end)
    # Check that the final outbound endpoint is reachable after its departure.
    if minutes is None or elapsed(facts.outbound_departure, start) is None:
        result.reason = "MISSING_OR_INVALID_TIMES"
        return result
    if (local_date(start, facts.destination_timezone) is None
            or local_date(end, facts.return_origin_timezone) is None):
        result.reason = "UNKNOWN_TIMEZONE"
        return result
    result.arrival_airport = facts.destination_airport
    result.departure_airport = facts.return_origin_airport
    result.airport_change = facts.destination_airport != facts.return_origin_airport
    result.airport_interval_minutes = minutes
    result.status = "ESTIMATED" if facts.outbound_arrival_calculated else "KNOWN"
    return result
