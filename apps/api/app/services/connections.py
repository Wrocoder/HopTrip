"""Same-ticket connection warnings; never inventory, MCT or transfer protection."""
from datetime import UTC, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.models.offer import TravelOffer
from app.schemas.connection import ConnectionAssessment, ConnectionPolicy, ConnectionRead, Direction
from app.services.flight_reference import airport_timezone
from app.services.flight_routes import connection_warning_segments, instant


def overnight_connection(arrival: datetime, departure: datetime, zone: str | None) -> bool | None:
    if not zone:
        return None
    try:
        tz = ZoneInfo(zone)
    except (ZoneInfoNotFoundError, ValueError):
        return None
    start, end = arrival.astimezone(tz), departure.astimezone(tz)
    # Night = crossing local midnight or any positive overlap with 00:00–06:00.
    # For airport changes both instants use the ARRIVAL airport zone.
    return departure > arrival and (end.date() > start.date() or start.hour < 6)


def assess_connections(offer: TravelOffer | None, *, policy: ConnectionPolicy | None = None,
                       itinerary_context_valid: bool = True) -> ConnectionAssessment:
    result = ConnectionAssessment(policy=policy or ConnectionPolicy())
    if (offer is None or offer.source != "travelpayouts_data" or offer.product_type != "FLIGHT"
            or not isinstance(offer.raw_payload, dict)):
        return result
    directions: tuple[Direction, Direction] = ("OUTBOUND", "RETURN")
    if not itinerary_context_valid:
        return result
    segments = connection_warning_segments(offer, offer.route_details)
    if not segments:
        for direction, key in zip(directions, ("transfers", "return_transfers")):
            stops = offer.raw_payload.get(key)
            if (direction == "OUTBOUND" or offer.return_at is not None) and type(stops) is int and stops > 0:
                result.unknown_directions.append(direction)
        return result
    result.status = "KNOWN"
    for direction, legs in zip(directions, segments):
        for index, (previous, following) in enumerate(zip(legs, legs[1:]), 1):
            arrival, departure = instant(previous["arrival_at"]), instant(following["departure_at"])
            assert arrival is not None and departure is not None  # schedule validation above
            duration = int((departure.astimezone(UTC) - arrival.astimezone(UTC)).total_seconds() // 60)
            arrival_airport, departure_airport = previous["destination"], following["origin"]
            arrival_zone, departure_zone = airport_timezone(arrival_airport), airport_timezone(departure_airport)
            overnight = overnight_connection(arrival, departure, arrival_zone)
            airport_change = arrival_airport != departure_airport
            if overnight is None or departure_zone is None or airport_change:
                result.status = "PARTIAL"
            result.connections.append(ConnectionRead(direction=direction, after_leg=index,
                arrival_airport=arrival_airport, departure_airport=departure_airport,
                duration_minutes=duration, overnight=overnight, airport_change=airport_change,
                long_layover=duration >= result.policy.long_layover_minutes,
                risky_transfer=airport_change or duration < result.policy.short_transfer_minutes))
    return result
