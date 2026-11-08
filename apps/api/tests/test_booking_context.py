"""Booking links must describe the displayed offer without rewriting opaque tickets."""

import asyncio
from datetime import UTC, datetime, timedelta
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest
from app.config import Settings
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.deal import DealComponent
from app.models.location import Airport, Destination, DestinationAlias
from app.services import affiliate, partner_links
from app.services.deals import generate_flight_deal
from app.services.time import utc
from helpers import approved_program
from sqlalchemy import select
from test_flight_link_binding import synced
from test_partner_links import link_fixture as link_fixture
from test_partner_links import success
from test_return_routes import evidence, route_fixture


@pytest.mark.parametrize("conflict", [
    "origin", "origin_fallback", "destination", "mapped_origin", "mapped_destination", "departure",
    "invalid_date", "return_without_offer", "reversed_return", "return_date", "deal_departure",
    "deal_start", "deal_end", "product",
])
def test_contradictory_context_blocks_catalog_redirect_and_conversion(
    isolated_db, api_client, link_fixture, monkeypatch, conflict,
):
    db = isolated_db
    _, component, offer, deal = synced(db, link_fixture, monkeypatch)
    payload = {**offer.raw_payload}
    if conflict == "origin":
        payload["origin_airport"] = "KRK"
    elif conflict == "origin_fallback":
        payload["origin"] = "KRK"
    elif conflict == "destination":
        payload["destination_airport"] = "FCO"
    elif conflict == "mapped_origin":
        other = Airport(iata_code="KRK", name="Fixture", city="Fixture", country_code="PL")
        db.add(other)
        db.flush()
        offer.origin_airport_id = other.id
    elif conflict == "mapped_destination":
        other = Destination(city="Rome", country="Italy", country_code="IT", slug="rome")
        db.add(other)
        db.flush()
        offer.destination_id = other.id
    elif conflict == "departure":
        payload["departure_at"] = (utc(offer.depart_at) + timedelta(hours=1)).isoformat()
    elif conflict == "invalid_date":
        payload["depart_date"] = "2030-02-30"
    elif conflict == "return_without_offer":
        payload["return_at"] = (utc(offer.depart_at) + timedelta(days=3)).isoformat()
    elif conflict == "reversed_return":
        offer.return_at = offer.depart_at - timedelta(days=1)
    elif conflict == "return_date":
        offer.return_at = offer.depart_at + timedelta(days=3)
        payload["return_at"] = (utc(offer.return_at) + timedelta(days=1)).isoformat()
    elif conflict == "deal_departure":
        deal.depart_at += timedelta(days=1)
    elif conflict == "deal_start":
        payload["departure_at"] = utc(offer.depart_at).isoformat()
        deal.trip_start += timedelta(days=1)
    elif conflict == "deal_end":
        offer.return_at = offer.depart_at + timedelta(days=3)
        payload["return_at"] = utc(offer.return_at).isoformat()
        deal.trip_end += timedelta(days=1)
    else:
        offer.product_type = "HOTEL"
    offer.raw_payload = payload
    db.commit()
    assert not affiliate.component_policy(db, component).available
    public = api_client.get(f"/api/v1/deals/{deal.slug}").json()["components"][0]
    assert not public["available"] and public["redirect_path"] is None
    response = api_client.get(f"/go/{deal.slug}/flight?session_id=synthetic-session")
    assert response.status_code == 503 and "location" not in response.headers
    assert db.scalar(select(AffiliateClick)) is None
    assert db.scalar(select(AnalyticsEvent)) is None
    calls = []
    result = asyncio.run(partner_links.sync_partner_links(
        db, transport=httpx.MockTransport(lambda request: calls.append(request))))
    assert result.invalid_sources == 1 and result.updated == 0 and not calls
    assert "outbound_url" not in component.metadata_json


@pytest.mark.parametrize("source", [None, ["legacy"], "legacy", 42])
def test_malformed_source_is_cleared_without_crashing_sync(isolated_db, link_fixture, source):
    _, _, component, offer, _ = link_fixture
    offer.raw_payload = source
    isolated_db.commit()
    calls = []
    result = asyncio.run(partner_links.sync_partner_links(
        isolated_db, transport=httpx.MockTransport(lambda request: calls.append(request))))
    assert result.invalid_sources == 1 and not calls
    assert "outbound_url" not in component.metadata_json


@pytest.mark.parametrize("metadata", [["legacy"], "legacy", 42])
def test_malformed_component_is_unavailable_and_can_be_repaired_from_source(
    isolated_db, link_fixture, monkeypatch, metadata,
):
    settings, _, component, _, _ = link_fixture
    monkeypatch.setattr(affiliate, "get_settings", lambda: settings)
    component.metadata_json = metadata
    isolated_db.commit()
    policy = affiliate.component_policy(isolated_db, component)
    assert not policy.available and policy.reason == "INVALID_LINK"
    result = asyncio.run(partner_links.sync_partner_links(
        isolated_db, transport=httpx.MockTransport(success)))
    assert result.updated == 1 and affiliate.component_policy(isolated_db, component).available


@pytest.mark.parametrize("kind", ["FLIGHT", "flight"])
def test_ambiguous_component_never_selects_an_arbitrary_ticket(
    isolated_db, api_client, link_fixture, monkeypatch, kind,
):
    _, component, _, deal = synced(isolated_db, link_fixture, monkeypatch)
    isolated_db.add(DealComponent(deal_id=deal.id, component_type=kind,
        affiliate_program_id=component.affiliate_program_id, travel_offer_id=component.travel_offer_id,
        metadata_json={**component.metadata_json}))
    isolated_db.commit()
    response = api_client.get(f"/go/{deal.slug}/flight?session_id=synthetic-session")
    assert response.status_code == 503 and response.json()["detail"] == "AMBIGUOUS_COMPONENT"
    public = api_client.get(f"/api/v1/deals/{deal.slug}").json()["components"]
    assert len(public) == 2 and all(not p["available"] and p["redirect_path"] is None for p in public)
    assert isolated_db.scalar(select(AffiliateClick)) is None
    assert isolated_db.scalar(select(AnalyticsEvent)) is None


@pytest.mark.parametrize("origin,destination,airport,return_origin,return_destination", [
    ("WRO", "BCN", "BCN", "BCN", "WRO"),
    ("KRK", "LON", "STN", "LTN", "WAW"),
    ("GDN", "PAR", "BVA", "CDG", "GDN"),
])
def test_city_airport_alias_and_different_return_airports_keep_exact_source_ticket(
    isolated_db, api_client, link_fixture, monkeypatch,
    origin, destination, airport, return_origin, return_destination,
):
    settings, _, component, offer, deal = link_fixture
    db = isolated_db
    db.get(Airport, deal.origin_airport_id).iata_code = origin
    db.get(Destination, deal.destination_id).iata_code = destination
    db.add(DestinationAlias(destination_id=deal.destination_id, code=airport,
                            kind="AIRPORT", provider_code="travelpayouts_data"))
    offer.return_at = offer.depart_at + timedelta(days=3)
    # Synthetic source ticket, not a newly supported URL construction contract.
    ticket = f"/search/{origin}{offer.depart_at:%d%m}{destination}{offer.return_at:%d%m}1?t=opaque"
    offer.raw_payload = {**offer.raw_payload, "link": ticket, "origin_airport": origin,
        "destination": destination, "destination_airport": airport,
        "return_origin_airport": return_origin, "return_destination_airport": return_destination,
        "departure_at": utc(offer.depart_at).isoformat(), "return_at": utc(offer.return_at).isoformat()}
    db.commit()
    synced(db, link_fixture, monkeypatch)
    response = api_client.get(f"/go/{deal.slug}/flight")
    assert response.status_code == 307
    query = parse_qs(urlsplit(response.headers["location"]).query)
    assert query["sub_id"] == [partner_links.PLACEMENT_SUB_ID]
    assert partner_links.same_url(query["u"][0], partner_links.source_url(offer.raw_payload["link"]))
    assert settings.travelpayouts_marker == 123


def test_structured_open_jaw_return_books_departure_day_not_next_day_arrival(
    isolated_db, api_client, monkeypatch,
):
    db = isolated_db
    offer, row = route_fixture(db)
    offer.route_details = evidence(row)
    now = datetime.now(UTC)
    offer.last_verified_at, offer.expires_at = now, now + timedelta(hours=2)
    deal = generate_flight_deal(db, offer, now)
    program = approved_program(db)
    program.code, program.allowed_hosts, program.tracking_param = "aviasales", ["tp.media"], None
    db.commit()
    settings = Settings(travelpayouts_links_enabled=True, travelpayouts_marker=123,
        travelpayouts_project_id=456, travelpayouts_api_token="private-test-token")
    monkeypatch.setattr(partner_links, "get_settings", lambda: settings)
    monkeypatch.setattr(affiliate, "get_settings", lambda: settings)
    result = asyncio.run(partner_links.sync_partner_links(db, transport=httpx.MockTransport(success)))
    assert result.updated == 1
    public = api_client.get(f"/api/v1/deals/{deal.slug}").json()
    assert public["trip_end"] == "2030-11-04"
    assert public["flight_facts"]["return_origin_airport"] == "LTN"
    assert public["flight_facts"]["return_arrival"].startswith("2030-11-05")
    response = api_client.get(f"/go/{deal.slug}/flight")
    assert response.status_code == 307
    target = parse_qs(urlsplit(response.headers["location"]).query)["u"][0]
    assert partner_links.same_url(target, partner_links.source_url(offer.raw_payload["link"]))
