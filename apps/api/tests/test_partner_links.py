import asyncio
import json
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx
import pytest
from app.config import Settings
from app.models.data_provider import DataProvider
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.providers.base import ProviderNotConfigured, ProviderPermanentError, ProviderTransientError
from app.services import partner_links as service
from helpers import approved_program, catalog_fixture


@pytest.fixture
def link_fixture(isolated_db, monkeypatch):
    settings = Settings(
        travelpayouts_links_enabled=True,
        travelpayouts_marker=123,
        travelpayouts_project_id=456,
        travelpayouts_api_token="private-test-token",
    )
    monkeypatch.setattr(service, "get_settings", lambda: settings)
    program = approved_program(isolated_db)
    program.code = "aviasales"
    program.allowed_hosts = ["tp.media"]
    program.tracking_param = None
    deal, component = catalog_fixture(isolated_db, program=program)
    provider = DataProvider(code="travelpayouts_data", name="Fixture")
    isolated_db.add(provider)
    isolated_db.flush()
    offer = TravelOffer(
        data_provider_id=provider.id,
        external_id="one",
        depart_at=deal.depart_at,
        original_price=200,
        original_currency="PLN",
        source="travelpayouts_data",
        raw_payload={"link": "/search/WRO0101BCN04011?b=2&a=1"},
    )
    isolated_db.add(offer)
    isolated_db.flush()
    component.travel_offer_id = offer.id
    isolated_db.commit()
    return settings, program, component, offer, deal


def success(request):
    assert request.headers["X-Access-Token"] == "private-test-token"
    body = json.loads(request.content)
    assert len(body["links"]) <= 10
    items = []
    for item in body["links"]:
        url = urlsplit(item["url"])
        reordered = urlunsplit(url._replace(query=urlencode(sorted(parse_qsl(url.query)))))
        partner = "https://tp.media/r?" + urlencode({"marker": 123, "trs": 456, "u": reordered})
        items.append({"url": item["url"], "partner_url": partner, "code": "success"})
    return httpx.Response(200, json={"code": "success", "result": {"links": items}})


def test_sync_is_idempotent_and_refreshes_changed_target(isolated_db, link_fixture):
    _, program, component, offer, _ = link_fixture
    transport = httpx.MockTransport(success)
    first = asyncio.run(service.sync_partner_links(isolated_db, transport=transport))
    assert first.updated == 1 and component.affiliate_program_id == program.id
    old = component.metadata_json["outbound_url"]
    second = asyncio.run(service.sync_partner_links(isolated_db, transport=transport))
    assert second.unchanged == 1 and second.updated == 0
    offer.raw_payload = {"link": "/search/WRO0101BCN04011?expected_price=250"}
    isolated_db.commit()
    third = asyncio.run(service.sync_partner_links(isolated_db, transport=transport))
    assert third.updated == 1 and component.metadata_json["outbound_url"] != old


@pytest.mark.parametrize(
    "status,error",
    [(401, ProviderPermanentError), (429, ProviderTransientError), (503, ProviderTransientError)],
)
def test_error_clears_outdated_link_and_hides_payload(isolated_db, link_fixture, status, error):
    _, _, component, _, _ = link_fixture
    transport = httpx.MockTransport(
        lambda r: httpx.Response(status, text="private-test-token", headers={"Retry-After": "12"})
    )
    with pytest.raises(error) as caught:
        asyncio.run(service.sync_partner_links(isolated_db, transport=transport))
    assert "private-test-token" not in str(caught.value)
    assert "outbound_url" not in component.metadata_json
    if status == 429:
        assert caught.value.retry_after == 12


@pytest.mark.parametrize(
    "body",
    [
        [],
        {"code": "success", "result": {"links": []}},
        {"code": "success", "result": {"links": [{"code": "failed"}]}},
    ],
)
def test_incomplete_response_fails_closed(isolated_db, link_fixture, body):
    with pytest.raises(ProviderPermanentError):
        asyncio.run(
            service.sync_partner_links(
                isolated_db, transport=httpx.MockTransport(lambda r: httpx.Response(200, json=body))
            )
        )
    assert "outbound_url" not in link_fixture[2].metadata_json


def test_revoked_program_is_not_reapproved(isolated_db, link_fixture):
    link_fixture[1].onboarding_status = "SUSPENDED"
    isolated_db.commit()
    with pytest.raises(ProviderNotConfigured):
        asyncio.run(service.sync_partner_links(isolated_db))
    assert link_fixture[1].onboarding_status == "SUSPENDED"


def test_invalid_source_removes_link_without_request(isolated_db, link_fixture):
    link_fixture[3].raw_payload = {"link": "https://evil.example/search/"}
    isolated_db.commit()
    result = asyncio.run(service.sync_partner_links(isolated_db))
    assert result.invalid_sources == 1 and "outbound_url" not in link_fixture[2].metadata_json


def test_expired_deals_are_not_converted(isolated_db, link_fixture):
    link_fixture[4].status = "EXPIRED"
    isolated_db.commit()
    result = asyncio.run(service.sync_partner_links(isolated_db))
    assert result.updated == result.unchanged == 0


@pytest.mark.parametrize(
    "url",
    [
        "https://tp.media.evil/r?marker=123&trs=456",
        "https://user@tp.media/r",
        "https://tp.media:443/r",
        "http://tp.media/r",
        "https://tp.media/r?u=https://evil.example",
    ],
)
def test_partner_destination_is_restricted(url):
    assert not service.valid_partner(url, "https://www.aviasales.com/search/x", 123, 456)


def test_disabled_sync_does_not_require_program_or_token(isolated_db, monkeypatch):
    monkeypatch.setattr(
        service, "get_settings", lambda: Settings(travelpayouts_links_enabled=False)
    )
    assert not asyncio.run(service.sync_partner_links(isolated_db)).enabled


def test_retry_preserves_completed_batches(isolated_db, link_fixture, monkeypatch):
    component = link_fixture[2]
    for _ in range(10):
        isolated_db.add(
            DealComponent(
                deal_id=component.deal_id,
                component_type="FLIGHT",
                travel_offer_id=component.travel_offer_id,
            )
        )
    isolated_db.commit()
    calls = []

    async def no_wait(seconds):
        assert seconds >= 0.6

    monkeypatch.setattr(service.asyncio, "sleep", no_wait)

    def fail_second(request):
        calls.append(1)
        return success(request) if len(calls) == 1 else httpx.Response(503)

    with pytest.raises(ProviderTransientError):
        asyncio.run(
            service.sync_partner_links(isolated_db, transport=httpx.MockTransport(fail_second))
        )
    retried = asyncio.run(
        service.sync_partner_links(isolated_db, transport=httpx.MockTransport(success))
    )
    assert len(calls) == 2 and retried.unchanged == 10 and retried.updated == 1
