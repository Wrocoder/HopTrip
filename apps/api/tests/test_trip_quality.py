import pytest
from app.schemas.connection import ConnectionAssessment, ConnectionRead
from app.schemas.deal import FlightQuality
from app.services.weekend import assess_weekend
from test_weekend_assessment import itinerary


def inputs(**patch):
    facts = itinerary(**({"destination_airport": "MAD", "return_origin_airport": "MAD"} | patch))
    quality = FlightQuality(status="COMPLETE", reasons=[])
    weekend = assess_weekend(facts)
    connections = ConnectionAssessment(status="KNOWN")
    return facts, quality, weekend, connections


def score(values=None, **kwargs):
    from app.services.trip_quality import trip_quality

    return trip_quality(*(values or inputs()), **kwargs)


def test_independent_convenience_score_has_six_auditable_parts():
    result = score()
    assert result.version == "trip-quality-v1" and result.status == "KNOWN"
    assert 0 <= result.score <= 100
    assert {part.key for part in result.components} == {"completeness", "travel", "usable_time", "connections", "airports", "leave"}
    assert all(part.known for part in result.components)
    assert sum(part.points for part in result.components) * 100 // sum(part.max_points for part in result.components) == result.score


@pytest.mark.parametrize("patch", [
    {"outbound_arrival": None}, {"return_arrival": None}, {"destination_timezone": None},
    {"outbound_arrival_calculated": True}, {"return_arrival_calculated": True},
])
def test_lost_or_estimated_information_never_improves_score(patch):
    result = score(inputs(**patch))
    assert result.status == "PARTIAL" and result.score < score().score
    assert any(not part.known and part.points == 0 for part in result.components)


def test_unverified_source_cannot_produce_a_numeric_convenience_score():
    facts, _, weekend, connections = inputs()
    result = score((facts, FlightQuality(), weekend, connections))
    assert result.score is None and result.status == "UNKNOWN"


def test_long_travel_less_daytime_airport_changes_and_leave_reduce_convenience():
    normal = score().score
    assert score(inputs(outbound_departure="2030-05-03T08:00:00+02:00")).score < normal
    assert score(inputs(outbound_arrival="2030-05-04T20:00:00+02:00")).score < normal
    assert score(inputs(return_destination_airport="KRK")).score < normal
    assert score(inputs(return_origin_airport="BCN")).score < normal


def test_connection_flags_and_missing_connection_data_are_not_safe_assumptions():
    facts, quality, weekend, _ = inputs()
    item = ConnectionRead(direction="RETURN", after_leg=1, arrival_airport="BER", departure_airport="BER",
        duration_minutes=360, overnight=True, airport_change=False, long_layover=True, risky_transfer=True)
    bad = score((facts, quality, weekend, ConnectionAssessment(status="KNOWN", connections=[item])))
    unknown = score((facts, quality, weekend, ConnectionAssessment()))
    assert bad.score < score().score and unknown.score < score().score
    assert unknown.status == "PARTIAL"


def test_configured_weights_and_thresholds_are_applied_without_mutating_defaults(monkeypatch):
    from app.config import Settings
    from app.schemas.trip_quality import TripQualityPolicy, TripQualityWeights
    from pydantic import ValidationError

    policy = TripQualityPolicy(weights=TripQualityWeights(completeness=0, travel=0, usable_time=0,
        connections=0, airports=0, leave=100))
    assert score(policy=policy).score == 100
    assert score(inputs(outbound_departure="2030-05-03T08:00:00+02:00"), policy=policy).score == 0
    assert score().policy.weights.usable_time == 30
    monkeypatch.setenv("TRIP_QUALITY_POLICY", '{"target_usable_minutes":3000}')
    assert Settings(_env_file=None).trip_quality_policy.target_usable_minutes == 3000
    for patch in ({"good_travel_minutes": 1500, "bad_travel_minutes": 1400}, {"target_usable_minutes": 0}):
        with pytest.raises(ValidationError):
            TripQualityPolicy(**patch)
    with pytest.raises(ValidationError):
        TripQualityWeights(completeness=0, travel=0, usable_time=0, connections=0, airports=0, leave=0)


def test_dst_intervals_are_elapsed_time_and_model_score_is_bounded():
    for start, arrival, back, home in [
        ("2030-03-29T18:00:00+01:00", "2030-03-29T20:00:00+01:00", "2030-03-31T19:00:00+02:00", "2030-03-31T21:00:00+02:00"),
        ("2030-10-25T18:00:00+02:00", "2030-10-25T20:00:00+02:00", "2030-10-27T19:00:00+01:00", "2030-10-27T21:00:00+01:00"),
    ]:
        result = score(inputs(outbound_departure=start, outbound_arrival=arrival, return_departure=back, return_arrival=home))
        assert result.score == score().score


def test_daytime_is_explicitly_modelled_not_confirmed_sightseeing_time():
    normal = score()
    night = score(inputs(outbound_departure="2030-05-03T23:00:00+02:00", outbound_arrival="2030-05-04T01:00:00+02:00"))
    assert night.score < normal.score


def test_more_daytime_cannot_hide_an_inconvenient_night_arrival_home():
    night = score(inputs(return_departure="2030-05-05T23:00:00+02:00", return_arrival="2030-05-06T01:00:00+02:00"))
    assert night.score < score().score
    assert "NIGHT_HOME_ARRIVAL" in night.reasons
