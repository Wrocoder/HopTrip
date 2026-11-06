import json
from datetime import date, timedelta

import pytest
from app.schemas.airport_context import AirportCityContext
from app.services import airport_context as module
from app.services.airport_context import airport_context, city_context
from app.services.catalog import serialize_deal
from pydantic import ValidationError
from test_trip_timeline import facts
from test_weekend_catalog import catalog as catalog

TODAY = date(2026, 11, 3)


def context(*, slug="milan", eligible=True, round_trip=True, **changes):
    value = facts(**({"destination_airport": "BGY", "return_origin_airport": "MXP",
                      "origin_airport": "WRO", "return_destination_airport": "KRK"} | changes))
    return airport_context(value, destination_slug=slug, round_trip=round_trip,
                           itinerary_eligible=eligible, as_of=TODAY)


def test_airport_switch_is_independent_from_missing_transfer_metadata():
    result = context()
    assert result.different_destination_airports and result.different_home_airports
    assert result.arrival.distance_km == 45 and result.arrival.remote is True
    assert result.return_departure.status == "UNKNOWN" and result.return_departure.airport == "MXP"
    assert {"DIFFERENT_DESTINATION_AIRPORTS", "DIFFERENT_HOME_AIRPORTS", "REMOTE_ARRIVAL_AIRPORT",
            "RETURN_METADATA_UNKNOWN", "TRANSFER_TIME_UNKNOWN"} <= set(result.warnings)
    assert result.arrival.travel_minutes is None and result.return_departure.travel_minutes is None


@pytest.mark.parametrize("code,slug,distance,remote", [
    ("BGY", "milan", 45, True), ("BGY", "bergamo", 5, False), ("BVA", "paris", 80, True),
])
def test_published_distance_is_specific_to_target_city(code, slug, distance, remote):
    result = city_context(code, slug, TODAY)
    assert result.status == "KNOWN" and result.distance_km == distance and result.remote is remote
    assert result.distance_basis == "PUBLISHER_UNSPECIFIED" and result.source.scheme == "https"
    assert result.last_verified_at == TODAY and result.travel_minutes is None
    assert result.travel_estimate_status == "UNKNOWN"


@pytest.mark.parametrize("code,slug", [(None, "milan"), ("bad", "milan"), ("ZZZ", "milan"),
                                     ("BGY", "paris"), ("LCY", "london"), ("BGY", "Milan")])
def test_unknown_airports_and_unreviewed_city_pairs_never_get_guessed(code, slug):
    result = city_context(code, slug, TODAY)
    assert result.status == "UNKNOWN" and result.remote is None and result.distance_km is None
    assert result.source is None and result.travel_minutes is None


@pytest.mark.parametrize("age,status,remote", [(0, "KNOWN", True), (180, "KNOWN", True),
                                             (181, "STALE", None), (-1, "STALE", None)])
def test_stale_or_future_review_never_certifies_distance(age, status, remote):
    result = city_context("BGY", "milan", TODAY + timedelta(days=age))
    assert result.status == status and result.remote is remote
    assert result.last_verified_at == TODAY and result.source is not None
    if status == "STALE":
        assert result.distance_km is None and result.distance_basis is None


@pytest.mark.parametrize("arrival,zone,warning", [
    ("2030-05-04T20:00:00Z", "Europe/Rome", "LATE_ARRIVAL"),
    ("2030-05-04T19:59:00Z", "Europe/Rome", None),
    ("2030-05-04T03:59:00Z", "Europe/Rome", "EARLY_ARRIVAL"),
    ("2030-05-04T04:00:00Z", "Europe/Rome", None),
    ("2030-10-27T00:30:00Z", "Europe/Rome", "EARLY_ARRIVAL"),
    ("2030-10-27T01:30:00Z", "Europe/Rome", "EARLY_ARRIVAL"),
    ("2030-05-04T23:30:00Z", "Europe/Rome", "EARLY_ARRIVAL"),  # Local next day.
    ("2030-05-04T23:30:00Z", "Unknown/Zone", "ARRIVAL_TIME_UNKNOWN"),
    ("2030-05-04T23:30:00", "Europe/Rome", "ARRIVAL_TIME_UNKNOWN"),
])
def test_arrival_categories_use_local_clock_not_utc_or_a_guessed_zone(arrival, zone, warning):
    result = context(outbound_arrival=arrival, destination_timezone=zone, outbound_arrival_calculated=True)
    actual = set(result.warnings) & {"LATE_ARRIVAL", "EARLY_ARRIVAL", "ARRIVAL_TIME_UNKNOWN"}
    assert actual == ({warning} if warning else set())
    assert result.arrival_time_estimated == (warning != "ARRIVAL_TIME_UNKNOWN")
    assert result.late_arrival_from == "22:00" and result.early_arrival_before == "06:00"


@pytest.mark.parametrize("depart,zone,early", [("2030-05-05T05:59:00Z", "Europe/Rome", True),
                                            ("2030-05-05T06:00:00Z", "Europe/Rome", False)])
def test_return_origin_zone_and_eight_am_boundary(depart, zone, early):
    result = context(return_departure=depart, return_origin_timezone=zone)
    assert ("EARLY_RETURN_DEPARTURE" in result.warnings) is early


def test_one_way_missing_times_and_unverified_context():
    one_way = context(round_trip=False, outbound_arrival=None)
    assert one_way.return_departure is None and one_way.different_destination_airports is None
    assert "ARRIVAL_TIME_UNKNOWN" in one_way.warnings and "RETURN_DEPARTURE_TIME_UNKNOWN" not in one_way.warnings
    missing = context(return_origin_timezone=None)
    assert "RETURN_DEPARTURE_TIME_UNKNOWN" in missing.warnings
    unverified = context(eligible=False)
    assert unverified.warnings == ["UNVERIFIED_ITINERARY"] and not unverified.itinerary_verified
    assert unverified.arrival.distance_km is None and unverified.different_destination_airports is None


def test_stale_warning_preserves_airport_change_but_not_remote_claim(monkeypatch):
    original = module.city_context
    monkeypatch.setattr(module, "city_context", lambda code, slug, today: original(code, slug, TODAY + timedelta(days=181)))
    result = context()
    assert "STALE_AIRPORT_METADATA" in result.warnings and result.different_destination_airports
    assert "REMOTE_ARRIVAL_AIRPORT" not in result.warnings


@pytest.mark.parametrize("raw", [None, [], {}, {"version": "unsupported", "records": []},
                               {"version": "airport-city-registry-v1", "records": [None, {"airport": "BGY"}]}])
def test_bad_registry_falls_back_to_unknown_without_crashing(tmp_path, monkeypatch, raw):
    path = tmp_path / "registry.json"
    path.write_text(json.dumps(raw), encoding="utf-8")
    monkeypatch.setattr(module, "REGISTRY_PATH", path)
    module.registry.cache_clear()
    try:
        assert city_context("BGY", "milan", TODAY).status == "UNKNOWN"
    finally:
        module.registry.cache_clear()


def test_missing_invalid_and_duplicate_registry_are_safe_and_cached(tmp_path, monkeypatch):
    path = tmp_path / "registry.json"
    monkeypatch.setattr(module, "REGISTRY_PATH", path)
    module.registry.cache_clear()
    try:
        assert module.registry() == {}  # Missing file.
        path.write_text("not-json", encoding="utf-8")
        module.registry.cache_clear()
        assert module.registry() == {}
        source = {"airport": "BGY", "destination_slug": "milan", "target_city": "Milan", "distance_km": 45,
                  "source": "https://www.milanbergamoairport.it/en/airport-infrastructure/", "last_verified_at": str(TODAY)}
        path.write_text(json.dumps({"version": "airport-city-registry-v1", "records": [source, source]}), encoding="utf-8")
        module.registry.cache_clear()
        assert module.registry() == {}  # Ambiguous duplicate, not last writer wins.
        path.write_text(json.dumps({"version": "airport-city-registry-v1", "records": [source]}), encoding="utf-8")
        module.registry.cache_clear()
        first = module.registry()
        assert first == module.registry() and module.registry.cache_info().hits == 1
    finally:
        module.registry.cache_clear()


def test_v1_cannot_claim_transfer_time_without_supported_estimate():
    with pytest.raises(ValidationError):
        AirportCityContext(travel_minutes=0)


def test_public_list_detail_and_serializer_share_the_additive_contract(api_client, isolated_db, catalog):
    deal = catalog(200)
    expected = serialize_deal(isolated_db, deal).airport_context.model_dump(mode="json")
    detail = api_client.get(f"/api/v1/deals/{deal.slug}")
    assert detail.status_code == 200 and detail.json()["airport_context"] == expected
    result = api_client.get("/api/v1/deals?sort=destination_time&include_total=true&limit=1").json()
    assert result["total"] == 1 and result["items"][0]["airport_context"] == expected
    assert expected["arrival"]["airport"] == "STN" and expected["return_departure"]["airport"] == "LTN"
    assert expected["different_destination_airports"] is True
    assert expected["arrival"]["travel_minutes"] is None
