"""Source itinerary quality, never live inventory or statistical price confidence."""

import re
from datetime import date

from app.models.offer import TravelOffer
from app.schemas.deal import FlightFacts, FlightQuality, FlightQualityReason
from app.services.flight_facts import flight_facts
from app.services.flight_routes import validated_segments
from app.services.time import offset_datetime, utc


def classify_flight_quality(
    offer: TravelOffer | None, facts: FlightFacts | None = None, *,
    origin_code: str | None = None, destination_codes: set[str] | None = None,
    conflicting_context: bool = False,
) -> FlightQuality:
    if (offer is None or offer.source != "travelpayouts_data" or offer.product_type != "FLIGHT"
            or not isinstance(offer.raw_payload, dict)):
        return FlightQuality()
    payload = offer.raw_payload
    facts = facts if facts is not None else flight_facts(offer)
    segments = validated_segments(offer, offer.route_details)
    critical: list[FlightQualityReason] = []
    partial: list[FlightQualityReason] = []
    if not facts.origin_airport:
        critical.append("MISSING_ORIGIN")
    if not facts.destination_airport:
        critical.append("MISSING_DESTINATION")
    if offer.return_at and (not facts.return_origin_airport or not facts.return_destination_airport):
        critical.append("MISSING_RETURN_AIRPORTS")
    if (origin_code and facts.origin_airport and origin_code != facts.origin_airport):
        critical.append("AIRPORT_MISMATCH")
    supplied_destinations = {code for code in (facts.destination_airport, facts.destination_code) if code}
    if destination_codes and supplied_destinations and not (destination_codes & supplied_destinations):
        critical.append("AIRPORT_MISMATCH")
    for start, end in ((facts.origin_airport, facts.destination_airport),
                       (facts.return_origin_airport, facts.return_destination_airport)):
        if start and end and start == end:
            critical.append("AIRPORT_MISMATCH")
    if conflicting_context:
        critical.append("CONFLICTING_METADATA")

    dates = [(payload.get("departure_at") or payload.get("depart_date"), offer.depart_at)]
    if offer.return_at is not None:
        dates.append((payload.get("return_at") or payload.get("return_date"), offer.return_at))
    elif payload.get("return_at") or payload.get("return_date"):
        critical.append("CONFLICTING_METADATA")
    for value, stored in dates:
        if not value:
            if segments is None:
                critical.append("MISSING_DATES")
            continue
        parsed = offset_datetime(value)
        if parsed:
            if utc(parsed) != utc(stored):
                critical.append("INVALID_DATES")
        elif isinstance(value, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            try:
                if date.fromisoformat(value) != utc(stored).date():
                    critical.append("INVALID_DATES")
            except ValueError:
                critical.append("INVALID_DATES")
        else:
            critical.append("INVALID_DATES")
    if offer.return_at and utc(offer.return_at) < utc(offer.depart_at):
        critical.append("INVALID_DATES")
    if (facts.outbound_arrival and facts.return_departure
            and utc(facts.outbound_arrival) > utc(facts.return_departure)):
        critical.append("INVALID_DATES")

    duration_names = ["duration_to"] + (["duration_back"] if offer.return_at else [])
    for name in duration_names:
        duration = payload.get(name)
        if duration is not None and (type(duration) is not int or not 0 < duration <= 10080):
            critical.append("INVALID_DURATION")
    if (isinstance(offer.route_details, dict) and "segments" in offer.route_details
            and segments is None):
        critical.append("CONFLICTING_METADATA")

    clocks = [facts.outbound_departure, facts.outbound_arrival]
    zones = [facts.origin_timezone, facts.destination_timezone]
    stops = [facts.outbound_stops]
    if offer.return_at:
        clocks += [facts.return_departure, facts.return_arrival]
        zones += [facts.return_origin_timezone, facts.return_destination_timezone]
        stops.append(facts.return_stops)
    if any(clock is None for clock in clocks):
        partial.append("MISSING_TIMES")
    if facts.outbound_arrival_calculated or facts.return_arrival_calculated:
        partial.append("ESTIMATED_TIMES")
    if any(zone is None for zone in zones):
        partial.append("UNKNOWN_TIMEZONE")
    if any(count is None for count in stops):
        partial.append("UNKNOWN_STOPS")
    if (not facts.airline_code and not any(leg.airline_code for leg in facts.outbound_legs)) or (
        offer.return_at and not any(leg.airline_code for leg in facts.return_legs)
    ):
        partial.append("UNKNOWN_CARRIER")
    return FlightQuality(
        status="CRITICAL_INCOMPLETE" if critical else "PARTIAL" if partial else "COMPLETE",
        reasons=list(dict.fromkeys(critical + partial)),
    )
