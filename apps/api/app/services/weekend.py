"""Pure weekend-v1 predicates. All work hours refer to the outbound origin zone."""
from datetime import UTC, datetime, time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.schemas.deal import FlightFacts
from app.schemas.weekend import (
    Eligibility,
    WeekendAssessment,
    WeekendStayAssessment,
    WeekendStayPolicy,
    WorkHours,
)
from app.services.trip_timeline import elapsed, trip_timeline


def local(value: datetime | None, zone: str | None) -> datetime | None:
    if value is None or value.utcoffset() is None or not zone:
        return None
    try:
        return value.astimezone(ZoneInfo(zone))
    except (ZoneInfoNotFoundError, ValueError, OverflowError):
        return None


def eligibility(matches: bool) -> Eligibility:
    return "ELIGIBLE" if matches else "INELIGIBLE"


def assess_stay(facts: FlightFacts, policy: WeekendStayPolicy, *,
                itinerary_eligible: bool) -> WeekendStayAssessment:
    result = WeekendStayAssessment(policy=policy)
    if not itinerary_eligible:
        result.reasons.append("UNVERIFIED_ITINERARY")
        return result
    arrival = local(facts.outbound_arrival, facts.destination_timezone)
    back = local(facts.return_departure, facts.return_origin_timezone)
    if arrival is None or back is None:
        result.reasons.append("MISSING_TIMES_OR_TIMEZONE")
        return result
    result.night_arrival = arrival.hour < 6
    result.early_return = back.hour < 8
    if result.night_arrival:
        result.reasons.append("NIGHT_ARRIVAL")
    if result.early_return:
        result.reasons.append("EARLY_RETURN")
    if (not facts.destination_airport or not facts.return_origin_airport
            or facts.destination_airport != facts.return_origin_airport
            or facts.destination_timezone != facts.return_origin_timezone):
        result.reasons.append("DESTINATION_AIRPORT_UNCONFIRMED_OR_DIFFERENT")
        return result
    # A complete, consistently zoned journey is required for an endorsement.
    if (trip_timeline(facts).journey_elapsed_minutes is None
            or local(facts.outbound_departure, facts.origin_timezone) is None
            or local(facts.return_arrival, facts.return_destination_timezone) is None):
        result.reasons.append("INCOMPLETE_OR_INVALID_ITINERARY")
        return result
    span = (back.date() - arrival.date()).days
    if not 0 <= span <= 7:
        result.reasons.append("OUTSIDE_SHORT_TRIP_WINDOW")
        return result
    result.airport_interval_minutes = elapsed(arrival, back)
    start = arrival.astimezone(UTC) + timedelta(minutes=policy.arrival_buffer_minutes)
    end = back.astimezone(UTC) - timedelta(minutes=policy.departure_buffer_minutes)
    seconds = 0.0
    for index in range(span + 1):
        day = arrival.date() + timedelta(days=index)
        opening = datetime.combine(day, time(8), arrival.tzinfo).astimezone(UTC)
        closing = datetime.combine(day, time(22), arrival.tzinfo).astimezone(UTC)
        seconds += max(0, (min(end, closing) - max(start, opening)).total_seconds())
    result.usable_minutes = int(seconds // 60)
    if (result.airport_interval_minutes is None
            or result.airport_interval_minutes < policy.min_airport_minutes
            or result.usable_minutes < policy.min_usable_minutes):
        result.reasons.append("INSUFFICIENT_STAY")
    if facts.outbound_arrival_calculated or facts.return_arrival_calculated:
        result.reasons.append("ESTIMATED_TIMES")
        return result
    result.eligibility = eligibility(not result.reasons)
    return result


def assess_weekend(facts: FlightFacts, *, work_hours: WorkHours | None = None,
                   itinerary_eligible: bool = True,
                   stay_policy: WeekendStayPolicy | None = None) -> WeekendAssessment:
    hours = work_hours or WorkHours()
    timeline = trip_timeline(facts)
    result = WeekendAssessment(work_hours=hours, work_timezone=facts.origin_timezone,
        actual_return_local_date=timeline.local_return_arrival_date,
        airport_arrival_day_offset=timeline.return_arrival_day_offset,
        stay=assess_stay(facts, stay_policy or WeekendStayPolicy(),
                         itinerary_eligible=itinerary_eligible))
    start = local(facts.outbound_departure, facts.origin_timezone)
    back = local(facts.return_departure, facts.return_origin_timezone)
    home = local(facts.return_arrival, facts.return_destination_timezone)
    if not itinerary_eligible:
        result.reasons.append("UNVERIFIED_ITINERARY")
        return result
    if start is None or back is None or elapsed(start, back) is None:
        result.reasons.append("UNKNOWN_DEPARTURE_DATES")
        return result
    days = (back.date() - start.date()).days
    calendar = start.weekday() in (4, 5) and back.weekday() == 6 and days in (1, 2)
    flexible = start.weekday() in (3, 4, 5) and back.weekday() in (6, 0) and 1 <= days <= 4
    result.calendar, result.flexible = eligibility(calendar), eligibility(flexible)
    if not calendar:
        result.no_leave = "INELIGIBLE"
    if home is None or elapsed(back, home) is None:
        result.reasons.append("UNKNOWN_RETURN_ARRIVAL")
        return result
    # Validate the entire known itinerary, not just endpoints, before certifying it.
    if timeline.journey_elapsed_minutes is None:
        result.reasons.append("INCOMPLETE_OR_INVALID_ITINERARY")
        return result
    estimated = facts.return_arrival_calculated or facts.outbound_arrival_calculated
    result.confidence = "ESTIMATED" if estimated else "KNOWN"
    if estimated:
        result.reasons.append("ESTIMATED_TIMES")
    if not facts.origin_airport or facts.return_destination_airport != facts.origin_airport:
        result.reasons.append("RETURN_AIRPORT_UNCONFIRMED_OR_DIFFERENT")
        return result
    home_at_work = local(facts.return_arrival, facts.origin_timezone)
    assert home_at_work is not None  # start already validated this zone.
    # Avoid scanning unbounded or malformed provider intervals.
    span = (home_at_work.date() - start.date()).days
    if not 0 <= span <= 7:
        result.no_leave = "INELIGIBLE"
        result.reasons.append("OUTSIDE_SHORT_TRIP_WINDOW")
        return result
    overlaps = False
    for index in range(span + 1):
        day = start.date() + timedelta(days=index)
        if day.weekday() >= 5:
            continue
        work_start = datetime.combine(day, hours.start, start.tzinfo).astimezone(UTC)
        work_end = datetime.combine(day, hours.end, start.tzinfo).astimezone(UTC)
        overlaps |= start.astimezone(UTC) < work_end and home_at_work.astimezone(UTC) > work_start
    result.might_require_leave = True if overlaps else (None if estimated else False)
    # Deliberately conservative: this mode returns by the SAME Sunday, even if a
    # Monday arrival happens before work. Commute/border buffers remain unknown.
    fits = calendar and home_at_work.date() == back.date() and not overlaps
    result.no_leave = "INELIGIBLE" if not fits else ("UNKNOWN" if estimated else "ELIGIBLE")
    result.reasons.append("COMMUTE_AND_BORDER_TIME_UNKNOWN")
    return result
