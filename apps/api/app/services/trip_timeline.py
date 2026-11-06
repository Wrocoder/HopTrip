"""Derived airport-local dates; never substitute advertised departure dates."""
from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.schemas.deal import FlightFacts, TripTimeline


def local_date(value: datetime | None, zone: str | None) -> date | None:
    if value is None or value.utcoffset() is None or not zone:
        return None
    try:
        return value.astimezone(ZoneInfo(zone)).date()
    except (ZoneInfoNotFoundError, ValueError, OverflowError):
        return None


def elapsed(start: datetime | None, end: datetime | None) -> int | None:
    if start is None or end is None or start.utcoffset() is None or end.utcoffset() is None:
        return None
    seconds = (end.astimezone(UTC) - start.astimezone(UTC)).total_seconds()
    return int(seconds // 60) if seconds >= 0 else None


def trip_timeline(facts: FlightFacts) -> TripTimeline:
    departure = local_date(facts.outbound_departure, facts.origin_timezone)
    arrival = local_date(facts.outbound_arrival, facts.destination_timezone)
    back_departure = local_date(facts.return_departure, facts.return_origin_timezone)
    back_arrival = local_date(facts.return_arrival, facts.return_destination_timezone)
    stay_minutes = elapsed(facts.outbound_arrival, facts.return_departure)
    outbound_minutes = elapsed(facts.outbound_departure, facts.outbound_arrival)
    return_minutes = elapsed(facts.return_departure, facts.return_arrival)
    nights = None
    # With different destination zones there is no single known local stay calendar.
    if (arrival is not None and back_departure is not None and stay_minutes is not None
            and facts.destination_timezone == facts.return_origin_timezone):
        days = (back_departure - arrival).days
        nights = days if days >= 0 else None
    return TripTimeline(
        local_outbound_departure_date=departure,
        local_destination_arrival_date=arrival,
        local_return_departure_date=back_departure,
        local_return_arrival_date=back_arrival,
        nights_at_destination=nights,
        nights_estimated=nights is not None and facts.outbound_arrival_calculated,
        return_arrival_estimated=back_arrival is not None and facts.return_arrival_calculated,
        return_arrival_day_offset=(back_arrival - back_departure).days
        if back_arrival is not None and back_departure is not None
        and elapsed(facts.return_departure, facts.return_arrival) is not None else None,
        outbound_elapsed_minutes=outbound_minutes,
        return_elapsed_minutes=return_minutes,
        journey_elapsed_minutes=elapsed(facts.outbound_departure, facts.return_arrival)
        if all(value is not None for value in (stay_minutes, outbound_minutes, return_minutes)) else None,
    )
