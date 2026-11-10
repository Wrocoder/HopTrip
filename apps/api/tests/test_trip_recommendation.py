"""Synthetic audit cases; these fixtures are not current flight offers."""
import pytest
from app.schemas.airport_context import AirportContext
from app.schemas.connection import ConnectionAssessment, ConnectionRead
from app.services.trip_quality import trip_quality
from test_trip_quality import inputs


def test_high_score_and_complete_schedule_do_not_confirm_city_transfers():
    result = trip_quality(*inputs())
    assert result.status == "KNOWN" and result.score > 90
    recommendation = result.recommendation
    assert not recommendation.recommendation_eligible
    assert recommendation.label == "REQUIRES_PLANNING"
    assert recommendation.data_confidence == "LIMITED"
    assert recommendation.reasons == ["TRANSFER_TIME_UNKNOWN"]
    assert recommendation.planning_eligible


def test_bva_late_arrival_early_return_remains_planning_regardless_of_score():
    values = inputs(destination_airport="BVA", return_origin_airport="BVA",
        outbound_arrival="2030-05-03T22:20:00+02:00",
        return_departure="2030-05-05T06:00:00+02:00")
    airport = AirportContext(warnings=["REMOTE_ARRIVAL_AIRPORT", "LATE_ARRIVAL"])
    result = trip_quality(*values, airport=airport).recommendation
    assert not result.recommendation_eligible
    assert {"EARLY_RETURN", "LATE_ARRIVAL", "REMOTE_ARRIVAL_AIRPORT", "TRANSFER_TIME_UNKNOWN"} <= set(result.reasons)


@pytest.mark.parametrize("duration,overnight,risky,expected", [
    (359, False, False, None), (360, False, False, "LONG_CONNECTION"),
    (920, True, False, "OVERNIGHT_CONNECTION"), (60, False, True, "RISKY_CONNECTION"),
])
def test_connection_policy_boundaries_and_overnight_audit_case(duration, overnight, risky, expected):
    facts, quality, weekend, _ = inputs()
    connection = ConnectionRead(direction="RETURN", after_leg=1,
        arrival_airport="LPL", departure_airport="LPL", duration_minutes=duration,
        overnight=overnight, airport_change=False, long_layover=duration >= 360,
        risky_transfer=risky)
    result = trip_quality(facts, quality, weekend,
        ConnectionAssessment(status="KNOWN", connections=[connection])).recommendation
    assert not result.recommendation_eligible
    if expected:
        assert expected in result.reasons and result.warnings_severity == "CRITICAL"
        assert not result.planning_eligible
    else:
        assert "LONG_CONNECTION" not in result.reasons and result.warnings_severity == "WARNING"


@pytest.mark.parametrize("patch", [
    {"outbound_arrival": None}, {"outbound_arrival_calculated": True},
    {"destination_timezone": None}, {"return_origin_airport": None},
])
def test_missing_or_estimated_itinerary_is_not_a_convenience_promise(patch):
    result = trip_quality(*inputs(**patch)).recommendation
    assert not result.recommendation_eligible
    assert result.data_confidence == "INSUFFICIENT" and result.label == "INSUFFICIENT_DATA"
    assert not result.planning_eligible


def test_airport_change_and_unknown_connections_are_explicit():
    facts, quality, weekend, _ = inputs(return_origin_airport="BCN",
        return_departure="2030-05-04T05:00:00+02:00")
    result = trip_quality(facts, quality, weekend, ConnectionAssessment()).recommendation
    assert {"AIRPORT_CHANGE", "UNKNOWN_CONNECTIONS"} <= set(result.reasons)
    assert result.warnings_severity == "CRITICAL"


def test_insufficient_stay_is_a_critical_reason_with_same_airport():
    result = trip_quality(*inputs(return_departure="2030-05-04T05:00:00+02:00",
        return_arrival="2030-05-04T07:00:00+02:00")).recommendation
    assert "INSUFFICIENT_STAY" in result.reasons
    assert result.warnings_severity == "CRITICAL"


@pytest.mark.parametrize("back,home", [
    ("2030-03-31T19:00:00+02:00", "2030-03-31T21:00:00+02:00"),
    ("2030-10-27T19:00:00+01:00", "2030-10-27T21:00:00+01:00"),
])
def test_dst_does_not_turn_transfer_unknown_into_confirmed_convenience(back, home):
    spring = back.startswith("2030-03")
    start = "2030-03-29T18:00:00+01:00" if spring else "2030-10-25T18:00:00+02:00"
    arrival = "2030-03-29T20:00:00+01:00" if spring else "2030-10-25T20:00:00+02:00"
    result = trip_quality(*inputs(outbound_departure=start, outbound_arrival=arrival,
        return_departure=back, return_arrival=home)).recommendation
    assert result.label == "REQUIRES_PLANNING" and not result.recommendation_eligible
