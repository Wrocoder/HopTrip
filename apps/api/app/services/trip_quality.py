"""Convenience model only. No price/history, live inventory or invented city time."""
from app.schemas.connection import ConnectionAssessment
from app.schemas.deal import FlightFacts, FlightQuality
from app.schemas.trip_quality import (
    QualityPart,
    TripQualityAssessment,
    TripQualityComponent,
    TripQualityPolicy,
)
from app.schemas.weekend import WeekendAssessment
from app.services.trip_timeline import trip_timeline
from app.services.weekend import local


def trip_quality(facts: FlightFacts, quality: FlightQuality, weekend: WeekendAssessment,
                 connections: ConnectionAssessment, *, policy: TripQualityPolicy | None = None
                 ) -> TripQualityAssessment:
    policy = policy or TripQualityPolicy()
    result = TripQualityAssessment(policy=policy)
    if not quality.recommendation_eligible:
        result.reasons.append("UNVERIFIED_ITINERARY")
        return result
    if quality.status == "PARTIAL":
        result.reasons.append("PARTIAL_SOURCE_DATA")

    def part(key: QualityPart, percent: int | None):
        maximum = getattr(policy.weights, key)
        result.components.append(TripQualityComponent(key=key, max_points=maximum,
            points=0 if percent is None else maximum * max(0, min(100, percent)) // 100,
            known=percent is not None))
        if percent is None:
            result.reasons.append(f"UNKNOWN_{key.upper()}")

    part("completeness", 100 if quality.status == "COMPLETE" else 50)
    timeline = trip_timeline(facts)
    times_known = (timeline.journey_elapsed_minutes is not None
        and not facts.outbound_arrival_calculated and not facts.return_arrival_calculated
        and all(value is not None for value in (timeline.local_outbound_departure_date,
            timeline.local_destination_arrival_date, timeline.local_return_departure_date,
            timeline.local_return_arrival_date)))
    travel = None
    if times_known and timeline.outbound_elapsed_minutes is not None and timeline.return_elapsed_minutes is not None:
        minutes = timeline.outbound_elapsed_minutes + timeline.return_elapsed_minutes
        travel = (policy.bad_travel_minutes - minutes) * 100 // (policy.bad_travel_minutes - policy.good_travel_minutes)
        home = local(facts.return_arrival, facts.return_destination_timezone)
        if home is not None and home.hour < 6:
            travel = max(0, min(100, travel)) * policy.night_home_travel_percent // 100
            result.reasons.append("NIGHT_HOME_ARRIVAL")
    part("travel", travel)
    usable = None
    stay = weekend.stay
    if (times_known and stay.eligibility != "UNKNOWN" and stay.usable_minutes is not None):
        usable = min(100, stay.usable_minutes * 100 // policy.target_usable_minutes)
        if stay.night_arrival or stay.early_return:
            usable = usable * policy.inconvenient_stay_percent // 100
    part("usable_time", usable)
    connection_percent = None
    if connections.status == "KNOWN":
        penalty = sum(policy.connection_penalty_percent
            + policy.long_connection_penalty_percent * item.long_layover
            + policy.night_connection_penalty_percent * bool(item.overnight)
            + policy.risky_connection_penalty_percent * item.risky_transfer
            for item in connections.connections)
        connection_percent = max(0, 100 - penalty)
    part("connections", connection_percent)
    airports = (facts.origin_airport, facts.destination_airport,
                facts.return_origin_airport, facts.return_destination_airport)
    changes = int(facts.destination_airport != facts.return_origin_airport) + int(facts.origin_airport != facts.return_destination_airport)
    part("airports", max(0, 100 - changes * policy.airport_change_penalty_percent) if all(airports) else None)
    leave = weekend.might_require_leave
    part("leave", None if leave is None else 0 if leave else 100)
    total = sum(item.points for item in result.components)
    maximum = sum(item.max_points for item in result.components)
    result.score = total * 100 // maximum
    result.status = "KNOWN" if quality.status == "COMPLETE" and all(item.known for item in result.components) else "PARTIAL"
    return result
