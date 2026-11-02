"""Synthetic quality cases; source completeness is independent of booking availability."""

from copy import deepcopy
from datetime import UTC, datetime, timedelta

import pytest
from app.services.catalog import serialize_deal
from app.services.deals import generate_flight_deal
from app.services.flight_quality import classify_flight_quality
from helpers import approved_program, catalog_fixture
from test_return_routes import evidence, route_fixture


def test_legacy_offer_remains_accessible_with_explicit_critical_quality(api_client, isolated_db):
    deal, _ = catalog_fixture(isolated_db, program=approved_program(isolated_db))
    deal.is_featured = True
    isolated_db.commit()
    response = api_client.get("/api/v1/deals/" + deal.slug)
    assert response.status_code == 200
    quality = response.json()["flight_quality"]
    assert quality["status"] == "CRITICAL_INCOMPLETE"
    assert not quality["recommendation_eligible"]
    assert not response.json()["is_featured"] and deal.is_featured
    assert api_client.get("/api/v1/deals?include_total=true").json()["total"] == 1
    assert api_client.get("/go/" + deal.slug + "/flight", follow_redirects=False).status_code == 307
    assert serialize_deal(isolated_db, deal).components[0].available


def test_complete_itinerary_does_not_create_booking_availability(api_client, isolated_db):
    offer = complete(isolated_db)
    now = datetime.now(UTC)
    offer.last_verified_at, offer.fetched_at = now, now
    offer.expires_at = now + timedelta(hours=1)
    isolated_db.commit()
    deal = generate_flight_deal(isolated_db, offer, now)
    body = api_client.get("/api/v1/deals/" + deal.slug).json()
    assert body["flight_quality"]["status"] == "COMPLETE"
    assert body["flight_quality"]["recommendation_eligible"]
    assert not body["components"][0]["available"]


def complete(db):
    offer, row = route_fixture(db)
    offer.route_details = evidence(row)
    return offer


def test_complete_expired_and_open_jaw_data_have_the_same_source_quality(isolated_db):
    offer = complete(isolated_db)
    before = deepcopy((offer.raw_payload, offer.route_details))
    quality = classify_flight_quality(offer, origin_code="WRO", destination_codes={"LON", "STN"})
    assert quality.status == "COMPLETE" and quality.recommendation_eligible
    assert quality.reasons == []
    # The validated return is LTN -> WRO, not a guessed reverse of WRO -> STN.
    offer.expires_at = offer.last_verified_at - timedelta(hours=1)
    assert classify_flight_quality(offer) == quality
    assert (offer.raw_payload, offer.route_details) == before


@pytest.mark.parametrize("missing,reason", [
    ("origin_airport", "MISSING_ORIGIN"), ("destination_airport", "MISSING_DESTINATION"),
    ("departure_at", "MISSING_DATES"), ("return_at", "MISSING_DATES"),
])
def test_required_missing_source_fields_are_critical(isolated_db, missing, reason):
    offer = complete(isolated_db)
    offer.route_details = None  # No independent structured evidence can fill the gap.
    offer.raw_payload = {key: value for key, value in offer.raw_payload.items() if key != missing}
    result = classify_flight_quality(offer)
    assert result.status == "CRITICAL_INCOMPLETE" and not result.recommendation_eligible
    assert reason in result.reasons


def test_validated_structured_dates_can_supply_missing_redundant_rest_fields(isolated_db):
    offer = complete(isolated_db)
    offer.raw_payload = {key: value for key, value in offer.raw_payload.items()
                         if key not in {"departure_at", "return_at", "transfers"}}
    before = deepcopy(offer.raw_payload)
    assert classify_flight_quality(offer).status == "COMPLETE"
    assert offer.raw_payload == before


def test_return_airports_are_not_invented_and_estimated_times_are_partial(isolated_db):
    offer = complete(isolated_db)
    offer.route_details = None
    result = classify_flight_quality(offer)
    assert result.status == "CRITICAL_INCOMPLETE" and "MISSING_RETURN_AIRPORTS" in result.reasons
    offer.raw_payload = {**offer.raw_payload, "return_origin_airport": "LTN", "return_destination_airport": "WRO"}
    result = classify_flight_quality(offer)
    assert result.status == "PARTIAL" and result.recommendation_eligible
    assert "ESTIMATED_TIMES" in result.reasons


@pytest.mark.parametrize("bad", ["invalid", "2030-02-30", "2030-11-01T13:00:00", "2030-11-02T13:00:00Z"])
def test_invalid_or_conflicting_dates_are_critical(isolated_db, bad):
    offer = complete(isolated_db)
    offer.raw_payload = {**offer.raw_payload, "departure_at": bad}
    assert "INVALID_DATES" in classify_flight_quality(offer).reasons


@pytest.mark.parametrize("duration", [-1, 0, 10081, True, "120", 1.5])
def test_unreasonable_or_untrusted_durations_are_critical(isolated_db, duration):
    offer = complete(isolated_db)
    offer.raw_payload = {**offer.raw_payload, "duration_to": duration}
    result = classify_flight_quality(offer)
    assert result.status == "CRITICAL_INCOMPLETE" and "INVALID_DURATION" in result.reasons


@pytest.mark.parametrize("kind", ["origin", "destination", "same_airport", "context", "segments"])
def test_airport_and_provider_conflicts_are_critical(isolated_db, kind):
    offer = complete(isolated_db)
    options = {}
    if kind == "origin":
        options["origin_code"] = "KRK"
    elif kind == "destination":
        options["destination_codes"] = {"BCN"}
    elif kind == "same_airport":
        offer.route_details = None
        offer.raw_payload = {**offer.raw_payload, "destination_airport": "WRO"}
    elif kind == "context":
        options["conflicting_context"] = True
    else:
        offer.raw_payload = {**offer.raw_payload, "return_destination_airport": "WRO"}
        details = deepcopy(offer.route_details)
        details["segments"][1]["flight_legs"][0]["destination"] = "KRK"
        offer.route_details = details
    assert classify_flight_quality(offer, **options).status == "CRITICAL_INCOMPLETE"


def test_date_only_one_way_is_partial_without_fabricated_clock(isolated_db):
    offer = complete(isolated_db)
    offer.route_details = None
    offer.return_at = None
    offer.departure_precision = "DATE"
    offer.raw_payload = {**offer.raw_payload, "departure_at": "2030-11-01"}
    offer.raw_payload.pop("return_at")
    result = classify_flight_quality(offer)
    assert result.status == "PARTIAL" and "MISSING_TIMES" in result.reasons


@pytest.mark.parametrize("payload", [None, [], "invalid"])
def test_malformed_payload_fails_closed_without_mutation(isolated_db, payload):
    offer = complete(isolated_db)
    offer.raw_payload = payload
    result = classify_flight_quality(offer)
    assert result.status == "CRITICAL_INCOMPLETE" and offer.raw_payload == payload
