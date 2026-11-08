from datetime import UTC

import pytest
from app.services.weekend import assess_weekend
from test_weekend_assessment import itinerary
from test_weekend_catalog import catalog as catalog


def trip(**patch):
    return itinerary(**({"destination_airport": "MAD", "return_origin_airport": "MAD"} | patch))


def test_recommendation_measures_buffered_daytime_not_airport_interval():
    result = assess_weekend(trip()).stay
    assert result.eligibility == "ELIGIBLE"
    # Fri 20:00 arrival + 2h; Sat 08–22; Sun 08–17 (2h before departure).
    assert result.usable_minutes == 23 * 60
    assert result.airport_interval_minutes == 47 * 60
    assert result.policy.min_usable_minutes == 720
    assert result.night_arrival is False and result.early_return is False


@pytest.mark.parametrize("patch,reason", [
    ({"outbound_departure": "2030-05-04T20:00:00+02:00",
      "outbound_arrival": "2030-05-04T22:00:00+02:00"}, "INSUFFICIENT_STAY"),
    ({"outbound_departure": "2030-05-03T23:30:00+02:00",
      "outbound_arrival": "2030-05-04T01:30:00+02:00"}, "NIGHT_ARRIVAL"),
    ({"return_departure": "2030-05-05T06:00:00+02:00",
      "return_arrival": "2030-05-05T08:00:00+02:00"}, "EARLY_RETURN"),
])
def test_calendar_weekend_can_be_unsuitable_without_disappearing_from_calendar(patch, reason):
    result = assess_weekend(trip(**patch))
    assert result.calendar == "ELIGIBLE"
    assert result.stay.eligibility == "INELIGIBLE"
    assert reason in result.stay.reasons


@pytest.mark.parametrize("patch", [
    {"outbound_arrival": None}, {"return_arrival": None},
    {"destination_timezone": "Unknown/Zone"}, {"return_origin_timezone": None},
    {"return_origin_airport": "BCN"}, {"return_origin_airport": None},
    {"outbound_arrival_calculated": True}, {"return_arrival_calculated": True},
    {"return_arrival": "2030-05-05T18:00:00+02:00"},
    {"outbound_arrival": "2030-05-06T20:00:00+02:00"},
])
def test_missing_estimated_inconsistent_and_changed_airport_never_certify_stay(patch):
    assert assess_weekend(trip(**patch)).stay.eligibility == "UNKNOWN"


def test_unverified_source_and_leave_are_separate_guards():
    value = trip(outbound_departure="2030-05-03T08:00:00+02:00")
    result = assess_weekend(value)
    assert result.stay.eligibility == "ELIGIBLE" and result.might_require_leave is True
    assert assess_weekend(value, itinerary_eligible=False).stay.eligibility == "UNKNOWN"


@pytest.mark.parametrize("start,arrival,back,home", [
    ("2030-03-29T18:00:00+01:00", "2030-03-29T20:00:00+01:00",
     "2030-03-31T19:00:00+02:00", "2030-03-31T21:00:00+02:00"),
    ("2030-10-25T18:00:00+02:00", "2030-10-25T20:00:00+02:00",
     "2030-10-27T19:00:00+01:00", "2030-10-27T21:00:00+01:00"),
])
def test_dst_daytime_window_uses_utc_intersection(start, arrival, back, home):
    result = assess_weekend(trip(outbound_departure=start, outbound_arrival=arrival,
        return_departure=back, return_arrival=home)).stay
    assert result.eligibility == "ELIGIBLE" and result.usable_minutes == 1380


def test_configured_thresholds_are_inclusive_and_request_independent():
    from app.schemas.weekend import WeekendStayPolicy

    value = trip()
    assert assess_weekend(value, stay_policy=WeekendStayPolicy(min_usable_minutes=1380)).stay.eligibility == "ELIGIBLE"
    assert assess_weekend(value, stay_policy=WeekendStayPolicy(min_usable_minutes=1381)).stay.eligibility == "INELIGIBLE"
    assert assess_weekend(value).stay.policy.min_usable_minutes == 720


def test_airport_threshold_and_local_clock_boundaries_are_inclusive():
    from app.schemas.weekend import WeekendStayPolicy

    value = trip()
    assert assess_weekend(value, stay_policy=WeekendStayPolicy(min_airport_minutes=2820)).stay.eligibility == "ELIGIBLE"
    assert assess_weekend(value, stay_policy=WeekendStayPolicy(min_airport_minutes=2821)).stay.eligibility == "INELIGIBLE"
    assert assess_weekend(trip(outbound_arrival="2030-05-04T05:59:59+02:00")).stay.night_arrival is True
    assert assess_weekend(trip(outbound_arrival="2030-05-04T06:00:00+02:00")).stay.night_arrival is False
    assert assess_weekend(trip(return_departure="2030-05-05T07:59:59+02:00")).stay.early_return is True
    assert assess_weekend(trip(return_departure="2030-05-05T08:00:00+02:00")).stay.early_return is False


def test_local_clock_not_provider_offset_defines_night_and_early_return():
    value = trip(outbound_departure="2030-05-03T20:00:00Z",
        outbound_arrival="2030-05-03T23:00:00Z")
    assert assess_weekend(value).stay.night_arrival is True  # Madrid 01:00 Saturday.
    value.return_departure = value.return_departure.replace(hour=6, tzinfo=UTC)
    # 06:00 UTC == 08:00 Madrid: inclusive early-return boundary.
    assert assess_weekend(value).stay.early_return is False


def test_policy_validation_and_environment(monkeypatch):
    from app.config import Settings
    from app.schemas.weekend import WeekendStayPolicy
    from pydantic import ValidationError

    for patch in ({"min_usable_minutes": -1}, {"min_airport_minutes": 10081},
                  {"arrival_buffer_minutes": -1}):
        with pytest.raises(ValidationError):
            WeekendStayPolicy(**patch)
    monkeypatch.setenv("WEEKEND_STAY_POLICY", '{"min_usable_minutes":900}')
    assert Settings(_env_file=None).weekend_stay_policy.min_usable_minutes == 900


def test_api_keeps_unsuitable_offers_and_policy_agrees_with_batched_filter(api_client, isolated_db, catalog, monkeypatch):
    from app.config import get_settings
    from app.schemas.weekend import WeekendStayPolicy
    from weekend_browser_fixtures import weekend_fixtures

    catalog(200)
    weekend_fixtures(isolated_db, True, recommendations=True)
    query = "/api/v1/deals?destination=weekend-fixture&departure_from=2030-11-01&include_total=true"
    rows = api_client.get(query).json()
    assert rows["total"] == 8
    by_slug = {row["slug"]: row for row in rows["items"]}
    for slug, reason in (("night", "NIGHT_ARRIVAL"), ("early", "EARLY_RETURN"), ("short", "INSUFFICIENT_STAY")):
        row = by_slug[f"weekend-fixture-{slug}"]
        assert row["weekend_assessment"]["stay"]["eligibility"] == "INELIGIBLE"
        assert reason in row["weekend_assessment"]["stay"]["reasons"]
        assert api_client.get(f'/api/v1/deals/{row["slug"]}').json()["weekend_assessment"] == row["weekend_assessment"]
    assert by_slug["weekend-fixture-evening"]["weekend_assessment"]["stay"]["eligibility"] == "ELIGIBLE"
    assert by_slug["weekend-fixture-morning"]["weekend_assessment"]["might_require_leave"] is True
    assert by_slug["weekend-fixture-monday"]["weekend_assessment"]["no_leave"] == "INELIGIBLE"
    # The additive recommendation policy does not alter legacy/exact calendar membership.
    assert api_client.get(query + "&weekend=true").json()["total"] == 7
    monkeypatch.setattr(get_settings(), "weekend_stay_policy", WeekendStayPolicy(min_usable_minutes=4000))
    exact = api_client.get(query + "&weekend_mode=calendar-v1").json()
    evening = next(row for row in exact["items"] if row["slug"] == "weekend-fixture-evening")
    assert evening["weekend_assessment"]["stay"]["eligibility"] == "INELIGIBLE"
    assert evening["weekend_assessment"]["stay"]["policy"]["min_usable_minutes"] == 4000
    detail = api_client.get("/api/v1/deals/weekend-fixture-evening").json()
    assert evening["weekend_assessment"] == detail["weekend_assessment"]
