import asyncio
import json
from copy import deepcopy
from datetime import UTC, datetime, timedelta
from urllib.parse import parse_qs, urlencode, urlsplit

import httpx
import pytest
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.services import affiliate, partner_links
from sqlalchemy import select
from test_partner_links import link_fixture as link_fixture
from test_partner_links import success


def synced(db, fixture, monkeypatch, responder=success):
    settings, _, component, offer, deal = fixture
    monkeypatch.setattr(affiliate, "get_settings", lambda: settings, raising=False)
    asyncio.run(partner_links.sync_partner_links(db, transport=httpx.MockTransport(responder)))
    assert affiliate.component_policy(db, component).available
    return settings, component, offer, deal


@pytest.mark.parametrize("source", [
    {"link": "/search/KRK0202ROM05021?t=new-ticket"},
    {"link": "/search/WRO0101BCN04011?t=another-ticket"},
    {"link": None}, {}, ["not-an-object"],
])
def test_source_changes_disable_stored_link_immediately(isolated_db, link_fixture, monkeypatch, source):
    _, component, offer, _ = synced(isolated_db, link_fixture, monkeypatch)
    saved_url = component.metadata_json["outbound_url"]
    offer.raw_payload = source
    isolated_db.commit()
    policy = affiliate.component_policy(isolated_db, component)
    assert not policy.available and policy.reason == "ITINERARY_LINK_MISMATCH"
    assert component.metadata_json["outbound_url"] == saved_url  # Read-only, no repair/HTTP call.


def test_stale_click_is_not_redirected_or_counted_and_catalog_hides_link(isolated_db, api_client, link_fixture, monkeypatch):
    _, component, offer, deal = synced(isolated_db, link_fixture, monkeypatch)
    offer.raw_payload = {"link": "/search/WRO0303BCN06031?t=new"}
    isolated_db.commit()
    response = api_client.get(f"/api/v1/deals/{deal.slug}")
    assert response.status_code == 200
    item = response.json()["components"][0]
    assert not item["available"] and item["redirect_path"] is None
    response = api_client.get(f"/go/{deal.slug}/flight?session_id=synthetic-session")
    assert response.status_code == 503 and "location" not in response.headers
    assert isolated_db.scalar(select(AffiliateClick)) is None
    assert isolated_db.scalar(select(AnalyticsEvent)) is None
    assert "new" not in response.text and "tp.media" not in response.text


@pytest.mark.parametrize("name,value", [("travelpayouts_marker", 999), ("travelpayouts_project_id", 999),
                                       ("travelpayouts_marker", None), ("travelpayouts_project_id", None)])
def test_attribution_must_match_current_project(isolated_db, link_fixture, monkeypatch, name, value):
    settings, component, _, _ = synced(isolated_db, link_fixture, monkeypatch)
    setattr(settings, name, value)
    assert not affiliate.component_policy(isolated_db, component).available


def test_click_keeps_opaque_context_currency_and_attribution_without_refresh_token(isolated_db, api_client, link_fixture, monkeypatch):
    settings, _, component, offer, deal = link_fixture
    # These are synthetic source parameters, not newly invented supported fields.
    opaque = "/search/WRO0101BCN04011?" + urlencode([
        ("t", "opaque-ticket"), ("t", "connection-open-jaw"), ("label", "Málaga & Łódź"),
        ("adults", "1"), ("currency", "eur"), ("expected_price_currency", "usd"),
    ])
    offer.raw_payload = {"link": opaque}
    isolated_db.commit()
    def preserving_response(request):
        entries = json.loads(request.content)["links"]
        return httpx.Response(200, json={"code": "success", "result": {"links": [
            {"code": "success", "url": entry["url"], "partner_url": "https://tp.media/r?" + urlencode(
                {"marker": 123, "trs": 456, "sub_id": entry["sub_id"], "u": entry["url"]})}
            for entry in entries]}})
    synced(isolated_db, link_fixture, monkeypatch, preserving_response)
    settings.travelpayouts_links_enabled = False
    settings.travelpayouts_api_token = None
    before = deepcopy(component.metadata_json)
    response = api_client.get(f"/go/{deal.slug}/flight")
    assert response.status_code == 307
    outer = parse_qs(urlsplit(response.headers["location"]).query)
    assert outer["marker"] == ["123"] and outer["trs"] == ["456"]
    assert outer["sub_id"] == [partner_links.PLACEMENT_SUB_ID]
    inner = parse_qs(urlsplit(outer["u"][0]).query)
    assert inner["t"] == ["opaque-ticket", "connection-open-jaw"]
    assert inner["label"] == ["Málaga & Łódź"] and inner["adults"] == ["1"]
    assert inner["currency"] == ["pln"] and inner["expected_price_currency"] == ["usd"]
    assert component.metadata_json == before
    click = isolated_db.scalar(select(AffiliateClick))
    assert click is not None and click.anonymous_session_id == "not-provided"
    assert click.tracking_id is None
    assert isolated_db.scalar(select(AnalyticsEvent)) is None


def test_tracking_override_and_missing_source_cannot_bypass_identity_gate(isolated_db, link_fixture, monkeypatch):
    _, program, component, _, _ = link_fixture
    synced(isolated_db, link_fixture, monkeypatch)
    program.tracking_param = "sub_id"
    isolated_db.commit()
    assert not affiliate.component_policy(isolated_db, component, "ht-synthetic").available
    program.tracking_param = None
    component.travel_offer_id = None
    isolated_db.commit()
    assert not affiliate.component_policy(isolated_db, component).available


def test_url_query_order_does_not_change_same_source_identity(isolated_db, link_fixture, monkeypatch):
    _, component, offer, _ = synced(isolated_db, link_fixture, monkeypatch)
    offer.raw_payload = {"link": "/search/WRO0101BCN04011?a=1&b=2"}
    isolated_db.commit()
    assert affiliate.component_policy(isolated_db, component).available


@pytest.mark.parametrize("kind", ["flight", "HOTEL", "ACTIVITY"])
def test_component_case_or_type_does_not_bypass_aviasales_contract(isolated_db, link_fixture, monkeypatch, kind):
    _, component, offer, _ = synced(isolated_db, link_fixture, monkeypatch)
    component.component_type = kind
    if kind == 'flight':
        offer.raw_payload = {'link': '/search/changed-ticket'}
    isolated_db.commit()
    assert not affiliate.component_policy(isolated_db, component).available


@pytest.mark.parametrize('expired', ['deal', 'offer'])
def test_expired_offer_never_redirects_even_with_a_matching_ticket(isolated_db, api_client, link_fixture, monkeypatch, expired):
    _, _, offer, deal = synced(isolated_db, link_fixture, monkeypatch)
    target = deal if expired == 'deal' else offer
    target.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    isolated_db.commit()
    assert api_client.get(f'/api/v1/deals/{deal.slug}').status_code == 404
    response = api_client.get(f'/go/{deal.slug}/flight')
    assert response.status_code == 404 and 'location' not in response.headers
    assert isolated_db.scalar(select(AffiliateClick)) is None
