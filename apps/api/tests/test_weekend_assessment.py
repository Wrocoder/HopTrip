from datetime import date, time

import pytest
from app.schemas.weekend import WorkHours
from app.services.weekend import assess_weekend
from pydantic import ValidationError
from test_trip_timeline import facts


def itinerary(**changes):
    return facts(**(dict(origin_airport="WRO", return_destination_airport="WRO",
        outbound_departure="2030-05-03T18:00:00+02:00",
        outbound_arrival="2030-05-03T20:00:00+02:00",
        return_departure="2030-05-05T19:00:00+02:00",
        return_arrival="2030-05-05T21:00:00+02:00") | changes))


@pytest.mark.parametrize("departure,expected,leave", [
    ("2030-05-03T08:00:00+02:00", "INELIGIBLE", True),
    ("2030-05-03T16:59:59+02:00", "INELIGIBLE", True),
    ("2030-05-03T17:00:00+02:00", "ELIGIBLE", False),
    ("2030-05-03T18:00:00+02:00", "ELIGIBLE", False),
    ("2030-05-04T08:00:00+02:00", "ELIGIBLE", False),
])
def test_no_leave_uses_origin_local_work_hours(departure, expected, leave):
    result = assess_weekend(itinerary(outbound_departure=departure,
        outbound_arrival="2030-05-04T10:00:00+02:00"))
    assert result.no_leave == expected and result.calendar == "ELIGIBLE"
    assert result.might_require_leave is leave
    assert result.confidence == "KNOWN" and result.airport_times_only
    assert "COMMUTE_AND_BORDER_TIME_UNKNOWN" in result.reasons


def test_configurable_hours_are_explicit_and_do_not_mutate_defaults():
    value = itinerary(outbound_departure="2030-05-03T16:00:00+02:00")
    assert assess_weekend(value).no_leave == "INELIGIBLE"
    result = assess_weekend(value, work_hours=WorkHours(start=time(7), end=time(15)))
    assert result.no_leave == "ELIGIBLE" and result.work_hours.end == time(15)
    assert assess_weekend(value).work_hours.end == time(17)


@pytest.mark.parametrize("arrival,leave", [
    ("2030-05-06T01:00:00+02:00", False),
    ("2030-05-06T09:00:00+02:00", False),
    ("2030-05-06T09:00:01+02:00", True),
])
def test_sunday_departure_monday_arrival_is_never_no_leave(arrival, leave):
    result = assess_weekend(itinerary(return_arrival=arrival))
    assert result.calendar == "ELIGIBLE" and result.no_leave == "INELIGIBLE"
    assert result.actual_return_local_date == date(2030, 5, 6)
    assert result.airport_arrival_day_offset == 1
    assert result.might_require_leave is leave


@pytest.mark.parametrize("departure,back,expected", [
    ("2030-05-02T18:00:00+02:00", "2030-05-06T18:00:00+02:00", "ELIGIBLE"),
    ("2030-05-03T18:00:00+02:00", "2030-05-06T18:00:00+02:00", "ELIGIBLE"),
    ("2030-05-03T18:00:00+02:00", "2030-05-13T18:00:00+02:00", "INELIGIBLE"),
])
def test_flexible_stays_bounded_to_one_weekend(departure, back, expected):
    result = assess_weekend(itinerary(outbound_departure=departure,
        outbound_arrival="2030-05-03T20:00:00+02:00", return_departure=back,
        return_arrival="2030-05-13T21:00:00+02:00"))
    assert result.flexible == expected and result.calendar == "INELIGIBLE"


@pytest.mark.parametrize("patch", [
    {"return_arrival": None}, {"return_destination_timezone": None},
    {"origin_timezone": "Unknown/Zone"}, {"outbound_departure": "2030-05-03T18:00:00"},
    {"return_arrival": "2030-05-05T18:00:00+02:00"},
    {"outbound_arrival": None}, {"return_destination_airport": "KRK"},
    {"return_destination_airport": None}, {"return_arrival_calculated": True},
    {"outbound_arrival_calculated": True},
])
def test_uncertainty_never_certifies_no_leave(patch):
    result = assess_weekend(itinerary(**patch))
    assert result.no_leave == "UNKNOWN" and result.might_require_leave is None
    assert result.reasons


@pytest.mark.parametrize("start,arrival,back,home", [
    ("2030-03-29T18:00:00+01:00", "2030-03-29T20:00:00+01:00",
     "2030-03-31T20:00:00+02:00", "2030-03-31T22:00:00+02:00"),
    ("2030-10-25T18:00:00+02:00", "2030-10-25T20:00:00+02:00",
     "2030-10-27T20:00:00+01:00", "2030-10-27T22:00:00+01:00"),
])
def test_dst_weekends_use_local_dates_and_utc_order(start, arrival, back, home):
    assert assess_weekend(itinerary(outbound_departure=start, outbound_arrival=arrival,
        return_departure=back, return_arrival=home)).no_leave == "ELIGIBLE"


def test_utc_friday_is_local_saturday_and_unverified_cannot_be_certified():
    value = itinerary(outbound_departure="2030-05-03T23:30:00Z",
        outbound_arrival="2030-05-04T03:30:00+02:00")
    assert assess_weekend(value).no_leave == "ELIGIBLE"
    result = assess_weekend(value, itinerary_eligible=False)
    assert result.no_leave == result.calendar == result.flexible == "UNKNOWN"
    assert result.confidence == "UNKNOWN"


@pytest.mark.parametrize("start,end", [(time(17), time(9)), (time(9), time(9))])
def test_invalid_work_hours_are_rejected(start, end):
    with pytest.raises(ValidationError):
        WorkHours(start=start, end=end)


def test_catalog_additive_assessment_and_legacy_pagination(api_client, isolated_db):
    from helpers import catalog_fixture

    deal, _ = catalog_fixture(isolated_db)
    detail = api_client.get(f"/api/v1/deals/{deal.slug}")
    assert detail.status_code == 200
    result = detail.json()["weekend_assessment"]
    assert result["version"] == "weekend-v1" and result["no_leave"] == "UNKNOWN"
    assert result["work_hours"] == {"start": "09:00:00", "end": "17:00:00"}
    page = api_client.get("/api/v1/deals?include_total=true&limit=1").json()
    assert page["total"] == 1 and page["items"][0]["weekend_assessment"] == result
    assert api_client.get("/api/v1/deals?weekend=true").json() == []
