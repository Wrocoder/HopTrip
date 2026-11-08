from copy import deepcopy
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from connection_fixtures import connection_offer


def assess(offer, **kwargs):
    from app.services.connections import assess_connections

    return assess_connections(offer, **kwargs)


@pytest.mark.parametrize("direction", ["OUTBOUND", "RETURN"])
@pytest.mark.parametrize("gap,long,risky", [(0, False, True), (89, False, True), (90, False, False),
    (359, False, False), (360, True, False), (361, True, False)])
def test_thresholds_both_directions_and_no_invented_protection(direction, gap, long, risky):
    offer = connection_offer(gap=gap, direction=direction)
    before = deepcopy(offer.route_details)
    result = assess(offer)
    assert result.status == "KNOWN" and len(result.connections) == 1
    connection = result.connections[0]
    assert connection.direction == direction and connection.duration_minutes == gap
    assert connection.long_layover is long and connection.risky_transfer is risky
    assert connection.protection == "UNKNOWN" and connection.overnight is False
    assert offer.route_details == before


@pytest.mark.parametrize("arrival,gap,expected,minutes", [
    ("2030-03-31T01:30:00+01:00", 60, True, 60),
    ("2030-10-27T02:30:00+02:00", 60, True, 60),
    ("2030-11-01T23:30:00+01:00", 60, True, 60),
    ("2030-11-01T01:00:00+01:00", 120, True, 120),
    ("2030-11-01T05:59:59+01:00", 1, True, 1),
    ("2030-11-01T06:00:00+01:00", 120, False, 120),
    # Source offset is UTC; Berlin local time is after midnight.
    ("2030-11-01T23:30:00Z", 30, True, 30),
])
def test_local_night_and_dst_use_utc_elapsed_time(arrival, gap, expected, minutes):
    connection = assess(connection_offer(arrival=arrival, gap=gap)).connections[0]
    assert connection.duration_minutes == minutes and connection.overnight is expected


def test_unknown_airport_zone_keeps_offset_duration_but_never_guesses_night():
    result = assess(connection_offer(airport="ZZZ", gap=400))
    assert result.status == "PARTIAL"
    connection = result.connections[0]
    assert connection.duration_minutes == 400 and connection.long_layover
    assert connection.overnight is None


def test_airport_change_is_warning_only_not_a_validated_flight_route():
    from app.services.flight_facts import flight_facts
    from app.services.flight_routes import validated_segments

    offer = connection_offer(airport="LHR", next_airport="LGW", gap=120)
    assert validated_segments(offer, offer.route_details) is None
    assert flight_facts(offer).outbound_legs == []
    result = assess(offer)
    assert result.status == "PARTIAL"
    connection = result.connections[0]
    assert connection.arrival_airport == "LHR" and connection.departure_airport == "LGW"
    assert connection.airport_change and connection.risky_transfer
    assert connection.protection == "UNKNOWN"


@pytest.mark.parametrize("kind", ["ticket", "price", "source", "naive", "backwards", "stops", "endpoint"])
def test_unbound_or_invalid_evidence_never_produces_connection_facts(kind):
    offer = connection_offer()
    if kind == "ticket":
        offer.raw_payload["link"] += "-different"
    elif kind == "price":
        offer.route_details["value"] = "900"
    elif kind == "source":
        offer.source = "unsupported"
    elif kind == "naive":
        offer.route_details["segments"][0]["flight_legs"][0]["arrival_at"] = "2030-11-01T10:00:00"
    elif kind == "backwards":
        offer.route_details["segments"][0]["flight_legs"][1]["departure_at"] = "2030-11-01T09:00:00Z"
    elif kind == "stops":
        offer.raw_payload["transfers"] = 3
    else:
        offer.route_details["segments"][0]["flight_legs"][-1]["destination"] = "MAD"
    result = assess(offer)
    assert result.status == "UNKNOWN" and result.connections == []


def test_missing_segments_are_unknown_not_a_zero_layover_or_protected_connection():
    offer = connection_offer()
    offer.route_details = None
    result = assess(offer)
    assert result.status == "UNKNOWN" and result.connections == []
    assert result.unknown_directions == ["OUTBOUND"]
    assert assess(None).status == "UNKNOWN"


def test_policy_configuration_is_inclusive_and_validated(monkeypatch):
    from app.config import Settings
    from app.schemas.connection import ConnectionPolicy
    from pydantic import ValidationError

    assert not assess(connection_offer(gap=360), policy=ConnectionPolicy(long_layover_minutes=361)).connections[0].long_layover
    monkeypatch.setenv("CONNECTION_POLICY", '{"long_layover_minutes":300}')
    assert Settings(_env_file=None).connection_policy.long_layover_minutes == 300
    for patch in ({"long_layover_minutes": 0}, {"long_layover_minutes": 10081}, {"short_transfer_minutes": -1}):
        with pytest.raises(ValidationError):
            ConnectionPolicy(**patch)


def test_unknown_provider_flags_do_not_become_confirmation():
    offer = connection_offer()
    offer.route_details.update(protected=True, self_transfer=False)
    assert assess(offer).connections[0].protection == "UNKNOWN"


def stored_connection(db, **kwargs):
    from test_return_routes import route_fixture

    stored, _ = route_fixture(db)
    value = connection_offer(**kwargs)
    for key in ("depart_at", "return_at", "raw_payload", "route_details", "original_price", "original_currency"):
        setattr(stored, key, getattr(value, key))
    stored.price_pln = Decimal(200)
    now = datetime.now(UTC)
    stored.last_verified_at = stored.fetched_at = now
    stored.expires_at = now + timedelta(hours=24)
    db.commit()
    return stored


def test_airport_warning_survives_real_enrichment_without_certifying_route(isolated_db):
    import asyncio

    from app.services.flight_facts import flight_facts
    from app.services.flight_routes import validated_segments
    from app.services.route_enrichment import enrich_routes
    from test_return_routes import provider_for

    offer = stored_connection(isolated_db, airport="LHR", next_airport="LGW")
    row = {**offer.route_details, "ticket_link": offer.raw_payload["link"]}
    offer.route_details = None
    before = (offer.price_pln, offer.last_verified_at, offer.expires_at)
    result = asyncio.run(enrich_routes(isolated_db, provider_for(row), datetime.now(UTC)))
    assert result.warning_routes == 1 and result.enriched == 0 and result.unmatched == 0
    assert assess(offer).connections[0].airport_change
    assert validated_segments(offer, offer.route_details) is None
    assert flight_facts(offer).outbound_legs == []
    assert (offer.price_pln, offer.last_verified_at, offer.expires_at) == before
    again = asyncio.run(enrich_routes(isolated_db, provider_for(row), datetime.now(UTC)))
    assert again.already_known == 1 and again.requests == 0


@pytest.mark.parametrize("airport,next_airport", [("BER", None), ("LHR", "LGW")])
def test_additive_assessment_reaches_list_detail_and_respects_config(api_client, isolated_db, monkeypatch, airport, next_airport):
    from app.config import get_settings
    from app.schemas.connection import ConnectionPolicy
    from app.services.deals import generate_flight_deal

    offer = stored_connection(isolated_db, airport=airport, next_airport=next_airport)
    deal = generate_flight_deal(isolated_db, offer, datetime.now(UTC))
    monkeypatch.setattr(get_settings(), "connection_policy", ConnectionPolicy(long_layover_minutes=400))
    detail = api_client.get(f"/api/v1/deals/{deal.slug}")
    assert detail.status_code == 200
    assessment = detail.json()["connection_assessment"]
    assert assessment["connections"][0]["duration_minutes"] == 360
    assert assessment["connections"][0]["long_layover"] is False
    assert assessment["policy"]["long_layover_minutes"] == 400
    listing = api_client.get("/api/v1/deals?include_total=true").json()
    assert listing["items"][0]["connection_assessment"] == assessment
    assert "ticket_key" not in detail.text and "private-ticket" not in detail.text
    if next_airport:
        assert detail.json()["flight_quality"]["status"] == "CRITICAL_INCOMPLETE"


def test_context_conflicts_and_one_way_missing_segments_remain_unknown():
    offer = connection_offer()
    assert assess(offer, itinerary_context_valid=False).connections == []
    offer.return_at = None
    result = assess(offer)
    assert result.status == "UNKNOWN" and result.unknown_directions == ["OUTBOUND"]
