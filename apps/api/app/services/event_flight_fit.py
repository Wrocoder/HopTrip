"""Conservative clock comparison, without estimating ground travel or event duration."""
from datetime import UTC, date, datetime, time
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.schemas.deal import FlightFacts
from app.schemas.event import EventFlightFit, EventRead, FitReason

BUFFER_MINUTES = 180  # Product warning threshold, not a route or airport check-in calculation.


def combined_flight_fit(event: EventRead, facts: FlightFacts, trip_start: date,
                        trip_end: date | None) -> EventFlightFit:
    if not event.ticket_options:
        return event_flight_fit(event, facts, trip_start, trip_end)
    fits = [event_flight_fit(event.model_copy(update=option.model_dump(exclude={'name', 'ticket_kind'})),
                            facts, trip_start, trip_end) for option in event.ticket_options]
    order = {'NO_KNOWN_CONFLICT': 0, 'CHECK': 1, 'TIGHT': 2, 'CONFLICT': 3}
    worst = max(fits, key=lambda fit: order[fit.status])
    reasons = list(dict.fromkeys(reason for fit in fits for reason in fit.reasons))
    durations = {fit.duration_minutes for fit in fits}
    duration = durations.pop() if len(durations) == 1 else None
    if duration is None and 'UNKNOWN_DURATION' not in reasons:
        reasons.append('UNKNOWN_DURATION')
    status = worst.status
    if reasons and status == 'NO_KNOWN_CONFLICT':
        status = 'CHECK'
    def minimum(field: str) -> int | None:
        values = [getattr(fit, field) for fit in fits if getattr(fit, field) is not None]
        return min(values) if values else None
    return worst.model_copy(update={'status': status, 'reasons': reasons, 'duration_minutes': duration,
        'arrival_gap_minutes': minimum('arrival_gap_minutes'),
        'return_start_gap_minutes': minimum('return_start_gap_minutes'),
        # A return margin from the end is known only if every option has an end time.
        'return_gap_minutes': minimum('return_gap_minutes') if all(fit.return_gap_minutes is not None for fit in fits) else None})


def instant(value: datetime | None) -> datetime | None:
    return value.astimezone(UTC) if value is not None and value.tzinfo is not None else None


def local_instants(day: date, clock: time, zone: ZoneInfo) -> list[datetime]:
    """A repeated wall time has two instants; a spring-forward gap has none."""
    wall = datetime.combine(day, clock.replace(tzinfo=None))
    candidates = {wall.replace(tzinfo=zone, fold=fold).astimezone(UTC) for fold in (0, 1)}
    return sorted(t for t in candidates if t.astimezone(zone).replace(tzinfo=None) == wall)


def event_instants(event: EventRead, zone: ZoneInfo | None) -> list[datetime]:
    start = instant(event.start_at)
    if start:
        if zone and (start.astimezone(zone).date() != event.start_date or (
                event.local_time is not None and start.astimezone(zone).time() != event.local_time)):
            return []
        return [start]
    return local_instants(event.start_date, event.local_time, zone) if event.local_time is not None and zone else []


def event_flight_fit(event: EventRead, facts: FlightFacts, trip_start: date,
                     trip_end: date | None) -> EventFlightFit:
    reasons: list[FitReason] = []
    conflict, tight = False, False
    arrival, departure = instant(facts.outbound_arrival), instant(facts.return_departure)
    # A return timestamp on a one-way offer must never invent a return journey.
    if trip_end is None:
        departure = None
    try:
        zone = ZoneInfo(event.timezone)
    except (ValueError, ZoneInfoNotFoundError):
        zone = None
        reasons.append("UNKNOWN_TIMEZONE")
    starts = event_instants(event, zone)
    if not starts:
        reasons.append("INVALID_EVENT_TIME" if event.local_time is not None and zone else "UNKNOWN_EVENT_TIME")
    if len(starts) > 1:
        reasons.append("AMBIGUOUS_EVENT_TIME")
    end = instant(event.end_at)
    if end and zone and (end.astimezone(zone).date() < event.start_date or (
            event.end_date is not None and end.astimezone(zone).date() != event.end_date)):
        end = None
    # Exact end time is evidence only when it follows every possible event start.
    if end is not None and starts and end <= max(starts):
        end = None
    duration = int((end - starts[0]).total_seconds() // 60) if end and len(starts) == 1 else None
    if duration is None:
        reasons.append("UNKNOWN_DURATION")
    if arrival is None:
        reasons.append("UNKNOWN_ARRIVAL")
    if trip_end is None:
        reasons.append("ONE_WAY")
    elif departure is None:
        reasons.append("UNKNOWN_RETURN")
    if not facts.destination_airport or (trip_end is not None and not facts.return_origin_airport):
        reasons.append("UNKNOWN_AIRPORT")

    # Dates without flight clocks indicate a mismatch, not a proven time collision.
    first = arrival.astimezone(zone).date() if arrival and zone else trip_start
    last = departure.astimezone(zone).date() if departure and zone else trip_end
    if zone and event.start_date < first:
        reasons.append("BEFORE_ARRIVAL" if arrival else "OUTSIDE_FLIGHT_DATES")
        conflict = conflict or arrival is not None
    if zone and last is not None and event.start_date > last:
        reasons.append("AFTER_RETURN" if departure else "OUTSIDE_FLIGHT_DATES")
        conflict = conflict or departure is not None
    if zone and last is not None and event.end_date is not None and event.end_date > last:
        reasons.append("ENDS_AFTER_RETURN" if departure else "OUTSIDE_FLIGHT_DATES")
        conflict = conflict or departure is not None

    arrival_gap = None
    if end and arrival and end < arrival:
        reasons.append("BEFORE_ARRIVAL")
        conflict = True
    if starts and arrival:
        arrival_gap = int((min(starts) - arrival).total_seconds() // 60)
        if all(t < arrival for t in starts):
            reasons.append("BEFORE_ARRIVAL")
            conflict = True
        elif arrival_gap < BUFFER_MINUTES:
            reasons.append("ARRIVAL_BUFFER")
            tight = True
    return_start_gap, return_gap = None, None
    if starts and departure:
        return_start_gap = int((departure - max(starts)).total_seconds() // 60)
        if all(t >= departure for t in starts):
            reasons.append("AFTER_RETURN")
            conflict = True
        elif return_start_gap < BUFFER_MINUTES:
            reasons.append("RETURN_BUFFER")
            tight = True
    if end and departure:
        return_gap = int((departure - end).total_seconds() // 60)
        if end >= departure:
            reasons.append("ENDS_AFTER_RETURN")
            conflict = True
        elif return_gap < BUFFER_MINUTES:
            reasons.append("RETURN_BUFFER")
            tight = True
    reasons = list(dict.fromkeys(reasons))
    status: Literal["CONFLICT", "TIGHT", "CHECK", "NO_KNOWN_CONFLICT"] = "CONFLICT" if conflict else "TIGHT" if tight else "CHECK" if reasons else "NO_KNOWN_CONFLICT"
    return EventFlightFit(status=status, reasons=reasons, buffer_minutes=BUFFER_MINUTES,
        arrival_gap_minutes=arrival_gap, return_gap_minutes=return_gap,
        return_start_gap_minutes=return_start_gap, duration_minutes=duration,
        arrival_airport=facts.destination_airport, return_airport=facts.return_origin_airport if trip_end else None,
        arrival_estimated=facts.outbound_arrival_calculated)
