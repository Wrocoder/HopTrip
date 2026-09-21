import asyncio
from datetime import date

import httpx
import pytest
from app.providers.base import (
    ProviderNotConfigured,
    ProviderPermanentError,
    ProviderTransientError,
    SearchQuery,
)
from app.providers.travelpayouts import TravelpayoutsDataProvider, _parse_datetime

ITEM = {
    "origin": "WRO",
    "destination": "BCN",
    "departure_at": "2030-10-01T08:00:00+02:00",
    "return_at": "2030-10-04T10:00:00+02:00",
    "price": 200.25,
    "airline": "XX",
    "flight_number": "1",
}


def test_v3_pagination_headers_and_unknown_timestamp():
    requests = []

    def handle(request):
        requests.append(request)
        page = int(request.url.params["page"])
        data = [{**ITEM, "flight_number": str(page)}] if page < 3 else []
        return httpx.Response(200, json={"success": True, "data": data})

    provider = TravelpayoutsDataProvider(
        token="mock-only", transport=httpx.MockTransport(handle), max_pages=5
    )
    result = asyncio.run(
        provider.search(SearchQuery(origin="WRO", limit=1, beginning_of_period=date(2030, 10, 1)))
    )
    assert len(result) == 2 and len(requests) == 3
    assert requests[0].url.path == "/aviasales/v3/prices_for_dates"
    assert requests[0].headers["X-Access-Token"] == "mock-only"
    assert requests[0].url.params["departure_at"] == "2030-10"
    assert requests[0].url.params["one_way"] == "false"
    assert result[0].source_observed_at is None
    assert result[0].depart_at.hour == 6


@pytest.mark.parametrize(
    "status,error",
    [
        (401, ProviderPermanentError),
        (403, ProviderPermanentError),
        (429, ProviderTransientError),
        (500, ProviderTransientError),
    ],
)
def test_provider_error_classification(status, error):
    provider = TravelpayoutsDataProvider(
        token="secret",
        transport=httpx.MockTransport(
            lambda r: httpx.Response(
                status, headers={"Retry-After": "999"}, text="do not log secret"
            )
        ),
    )
    with pytest.raises(error) as caught:
        asyncio.run(provider.search(SearchQuery(origin="WRO")))
    assert "secret" not in str(caught.value)
    if status in (429, 500):
        assert caught.value.retry_after == 300


def test_malformed_items_are_counted_and_missing_configuration_makes_no_requests():
    items = [
        ITEM,
        {**ITEM, "price": "NaN"},
        {**ITEM, "price": -1},
        {**ITEM, "return_at": None},
        {**ITEM, "departure_at": "2030-10-01T08:00:00"},
        None,
    ]
    provider = TravelpayoutsDataProvider(
        token="mock",
        transport=httpx.MockTransport(
            lambda r: httpx.Response(200, json={"success": True, "data": items})
        ),
    )
    assert len(asyncio.run(provider.search(SearchQuery(origin="WRO")))) == 1
    assert provider.rejected_items == 5
    provider.token = ""
    with pytest.raises(ProviderNotConfigured):
        asyncio.run(provider.search(SearchQuery(origin="WRO")))


def test_invalid_response_and_timeout():
    for response in (
        httpx.Response(200, text="bad"),
        httpx.Response(200, json={"success": False}),
        httpx.Response(200, json={"success": True, "data": {}}),
    ):
        provider = TravelpayoutsDataProvider(
            token="mock", transport=httpx.MockTransport(lambda r: response)
        )
        with pytest.raises(ProviderPermanentError):
            asyncio.run(provider.search(SearchQuery(origin="WRO")))

    def timeout(request):
        raise httpx.ReadTimeout("secret URL", request=request)

    with pytest.raises(ProviderTransientError, match="transport failure"):
        asyncio.run(
            TravelpayoutsDataProvider(token="mock", transport=httpx.MockTransport(timeout)).search(
                SearchQuery(origin="WRO")
            )
        )


def test_date_only_and_dst_offsets():
    assert _parse_datetime("2030-10-01").hour == 0
    assert _parse_datetime("2026-10-25T02:30:00+02:00") != _parse_datetime(
        "2026-10-25T02:30:00+01:00"
    )


@pytest.mark.parametrize(
    "kind,limit,expected_pages,expected_offers",
    [
        ("empty_page", 1, 1, 0),
        ("short_page", 2, 1, 1),
        ("repeated_page", 1, 2, 1),
        ("page_limit", 1, 2, 2),
    ],
)
def test_pagination_completion_is_reported(kind, limit, expected_pages, expected_offers):
    def handle(request):
        item = {**ITEM}
        if kind == "page_limit":
            item["flight_number"] = request.url.params["page"]
        return httpx.Response(
            200, json={"success": True, "data": [] if kind == "empty_page" else [item]}
        )

    provider = TravelpayoutsDataProvider(
        token="mock", max_pages=2, transport=httpx.MockTransport(handle)
    )
    offers = asyncio.run(provider.search(SearchQuery(origin="WRO", limit=limit)))
    assert len(offers) == expected_offers
    assert provider.diagnostics.pages_fetched == expected_pages
    assert provider.diagnostics.stop_reason == kind


@pytest.mark.parametrize("max_pages", [0, -1, 101])
def test_invalid_page_budget_is_not_silently_accepted(max_pages):
    with pytest.raises(ValueError, match="max_pages"):
        TravelpayoutsDataProvider(token="mock", max_pages=max_pages)


def test_mixed_records_are_reported_without_aborting_valid_offers():
    items = [
        ITEM,
        {**ITEM, "price": "NaN"},
        {**ITEM, "departure_at": "0001-01-01T00:00:00+14:00"},
        {**ITEM, "origin": "АВС"},
        {**ITEM, "currency": "РЛН"},
        {**ITEM, "return_at": "2030-10-05T10:00:00+02:00"},
        {**ITEM, "price": 201},
    ]
    provider = TravelpayoutsDataProvider(
        token="mock",
        transport=httpx.MockTransport(
            lambda r: httpx.Response(200, json={"success": True, "data": items})
        ),
    )
    offers = asyncio.run(provider.search(SearchQuery(origin="WRO", trip_duration=3)))
    assert len(offers) == 1 and offers[0].price == 201
    assert provider.diagnostics.received_items == 7
    assert provider.rejected_items == 4
    assert provider.diagnostics.filtered_items == 1
    assert provider.diagnostics.duplicate_offers == 1
    assert provider.diagnostics.stop_reason == "short_page"
    provider.token = ""
    with pytest.raises(ProviderNotConfigured):
        asyncio.run(provider.search(SearchQuery(origin="WRO")))
    assert provider.diagnostics.stop_reason == "not_started"
    assert provider.rejected_items == 0
