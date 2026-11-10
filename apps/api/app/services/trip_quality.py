"""Convenience model only. No price/history, live inventory or invented city time."""
from app.schemas.airport_context import AirportContext
from app.schemas.connection import ConnectionAssessment
from app.schemas.deal import FlightFacts, FlightQuality
from app.schemas.trip_quality import (
    QualityPart,
    TripQualityAssessment,
    TripQualityComponent,
    TripQualityPolicy,
    TripRecommendation,
)
from app.schemas.weekend import WeekendAssessment
from app.services.trip_timeline import trip_timeline
from app.services.weekend import local


def assess_recommendation(facts: FlightFacts, quality: FlightQuality, weekend: WeekendAssessment,
                          connections: ConnectionAssessment,
                          airport: AirportContext | None = None) -> TripRecommendation:
    """No price inputs. Current airport context cannot confirm city-transfer time.

    Fail closed for promises of convenience; do not remove offers from search.
    Thresholds come from the existing stay/connection/airport assessments.
    """
    result = TripRecommendation()
    missing: list[str] = []
    risks: list[str] = []
    if not quality.recommendation_eligible:
        missing.append("UNVERIFIED_ITINERARY")
    elif quality.status != "COMPLETE":
        missing.append("PARTIAL_SOURCE_DATA")
    if (weekend.confidence != "KNOWN" or facts.outbound_arrival_calculated
            or facts.return_arrival_calculated):
        missing.append("UNCONFIRMED_SCHEDULE")
    stay = weekend.stay
    if stay.eligibility == "UNKNOWN":
        missing.append("UNKNOWN_USABLE_TIME")
    elif stay.eligibility == "INELIGIBLE":
        risks.append("INSUFFICIENT_STAY")
    if connections.status != "KNOWN":
        missing.append("UNKNOWN_CONNECTIONS")
    for connection in connections.connections:
        if connection.overnight:
            risks.append("OVERNIGHT_CONNECTION")
        elif connection.overnight is None:
            missing.append("UNKNOWN_CONNECTION_NIGHT")
        if connection.long_layover:
            risks.append("LONG_CONNECTION")
        if connection.risky_transfer:
            risks.append("RISKY_CONNECTION")
        if connection.airport_change:
            risks.append("AIRPORT_CHANGE")
    if (facts.destination_airport and facts.return_origin_airport
            and facts.destination_airport != facts.return_origin_airport
            or facts.origin_airport and facts.return_destination_airport
            and facts.origin_airport != facts.return_destination_airport):
        risks.append("AIRPORT_CHANGE")
    if stay.night_arrival:
        risks.append("NIGHT_ARRIVAL")
    if stay.early_return:
        risks.append("EARLY_RETURN")
    home = local(facts.return_arrival, facts.return_destination_timezone)
    if home is not None and home.hour < 6:
        risks.append("NIGHT_HOME_ARRIVAL")
    if airport is not None:
        for warning in airport.warnings:
            if warning in {"LATE_ARRIVAL", "REMOTE_ARRIVAL_AIRPORT", "REMOTE_RETURN_AIRPORT"}:
                risks.append(warning)
    # The current contract only supports UNKNOWN transfer estimates. Never infer
    # operating hours, travel time or fare from distance or a high model score.
    missing.append("TRANSFER_TIME_UNKNOWN")
    result.reasons = list(dict.fromkeys(risks + missing))
    flight_missing = any(reason != "TRANSFER_TIME_UNKNOWN" for reason in missing)
    result.data_confidence = "INSUFFICIENT" if flight_missing else "LIMITED"
    result.label = "INSUFFICIENT_DATA" if flight_missing else "REQUIRES_PLANNING"
    severe = {"INSUFFICIENT_STAY", "OVERNIGHT_CONNECTION", "LONG_CONNECTION",
              "RISKY_CONNECTION", "AIRPORT_CHANGE"}
    result.warnings_severity = "CRITICAL" if severe.intersection(risks) else "WARNING"
    result.planning_eligible = (not severe.intersection(risks)
        and set(missing) <= {"PARTIAL_SOURCE_DATA", "TRANSFER_TIME_UNKNOWN"})
    return result


def recommendation_order(result: TripQualityAssessment) -> tuple[bool, bool, bool, bool]:
    """Apply the independent gate before the numeric model; retain all search rows."""
    recommendation = result.recommendation
    return (not recommendation.recommendation_eligible, not recommendation.planning_eligible,
            recommendation.data_confidence == "INSUFFICIENT",
            recommendation.warnings_severity == "CRITICAL")


def trip_quality(facts: FlightFacts, quality: FlightQuality, weekend: WeekendAssessment,
                 connections: ConnectionAssessment, *, policy: TripQualityPolicy | None = None,
                 airport: AirportContext | None = None
                 ) -> TripQualityAssessment:
    policy = policy or TripQualityPolicy()
    result = TripQualityAssessment(policy=policy)
    result.recommendation = assess_recommendation(facts, quality, weekend, connections, airport)
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
