import logging
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

import httpx
import pytest
from app.config import Settings, get_settings
from app.models.location import Destination
from app.models.offer import TravelOffer
from app.providers.ticketmaster import (
    EVENT_CITIES,
    EventsUnavailable,
    TicketmasterProvider,
    normalize_event,
    safe_ticket_url,
)
from app.schemas.event import EventResults
from app.services import events as service_module
from app.services.events import EventService, group_sessions
from pydantic import SecretStr
from tests.helpers import catalog_fixture

START, END = date(2026, 10, 24), date(2026, 10, 26)
CITY = EVENT_CITIES["paris"]


def raw_event():
    return {
        "id": "event-1", "name": "Concert", "url": "https://www.ticketmaster.fr/event/1",
        "dates": {"start": {"localDate": "2026-10-25", "localTime": "02:30:00"},
                  "timezone": "Europe/Paris", "status": {"code": "onsale"}},
        "classifications": [{"segment": {"name": "Music"}}],
        "_embedded": {"venues": [{"name": "Venue", "city": {"name": "Paris"},
                                   "country": {"countryCode": "FR"}}]},
    }


def test_normalization_preserves_local_dst_time_and_unknown_price():
    event = normalize_event(raw_event(), CITY, START, END)
    assert event is not None
    assert str(event.local_time) == "02:30:00" and event.timezone == "Europe/Paris"
    assert event.price_from is None and event.currency is None
    raw = raw_event()
    raw["dates"]["start"]["timeTBA"] = True
    assert normalize_event(raw, CITY, START, END).local_time is None
    raw["priceRanges"] = [{"min": "NaN", "currency": "EUR"}, {"min": "12.50", "currency": "EUR"}]
    assert normalize_event(raw, CITY, START, END).price_from == Decimal("12.50")


@pytest.mark.parametrize("status", ["cancelled", "canceled", "postponed", "unknown"])
def test_cancelled_and_uncertain_events_are_excluded(status):
    raw = raw_event()
    raw["dates"]["status"]["code"] = status
    assert normalize_event(raw, CITY, START, END) is None


def test_period_overlap_city_country_and_date_flags():
    raw = raw_event()
    raw["dates"]["start"]["localDate"] = "2026-09-01"
    raw["dates"]["end"] = {"localDate": "2026-10-24"}
    assert normalize_event(raw, CITY, START, END) is not None
    raw["dates"]["end"]["localDate"] = "2026-10-23"
    assert normalize_event(raw, CITY, START, END) is None
    for field in ["dateTBA", "dateTBD"]:
        raw = raw_event()
        raw["dates"]["start"][field] = True
        assert normalize_event(raw, CITY, START, END) is None
    for city, country in [("Versailles", "FR"), ("Paris", "US")]:
        raw = raw_event()
        raw["_embedded"]["venues"][0].update(city={"name": city}, country={"countryCode": country})
        assert normalize_event(raw, CITY, START, END) is None
    raw = raw_event()
    raw["dates"]["timezone"] = "America/New_York"
    assert normalize_event(raw, CITY, START, END) is None


@pytest.mark.parametrize("url", [
    "javascript:alert(1)", "https://ticketmaster.fr.attacker.test/event",
    "https://www.ticketmaster.fr@attacker.test/event", "http://www.ticketmaster.fr/event",
    "https://www.ticketmaster.fr/event?apikey=secret", "https://www.ticketmaster.fr:444/event",
])
def test_unsafe_ticket_links_are_rejected(url):
    assert safe_ticket_url(url) is None


def test_provider_contract_and_key_redaction(caplog):
    def respond(request):
        assert request.url.params["localStartEndDateTime"] == "2026-10-24T00:00:00,2026-10-26T23:59:59"
        assert request.url.params["segmentName"] == "Music"
        assert request.url.params["countryCode"] == "FR"
        return httpx.Response(200, json={"page": {"totalPages": 2}, "_embedded": {
            "events": [raw_event(), {"id": "malformed"}]}})
    with caplog.at_level(logging.INFO, logger="httpx"):
        with httpx.Client(transport=httpx.MockTransport(respond)) as client:
            events, more = TicketmasterProvider().fetch_page(client, "test-secret", CITY, START, END, "MUSIC", 0)
    assert len(events) == 1 and more
    assert "test-secret" not in caplog.text
    assert "REDACTED" in caplog.text


@pytest.mark.parametrize("status", [401, 429, 500, 302])
def test_provider_failure_is_sanitized(status):
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(status))) as client:
        with pytest.raises(EventsUnavailable) as exc:
            TicketmasterProvider().fetch_page(client, "test-secret", CITY, START, END, "ALL", 0)
    assert "test-secret" not in str(exc.value)


def test_cache_deduplicates_expires_and_refreshes_cancellations(monkeypatch):
    clock = [100.0]
    monkeypatch.setattr(service_module, "monotonic", lambda: clock[0])
    monkeypatch.setattr(service_module, "sleep", lambda _: None)
    source = [normalize_event(raw_event(), CITY, START, END)]
    calls = []
    def fetch(*args):
        calls.append(args[-1])
        return source + source, False
    monkeypatch.setattr(TicketmasterProvider, "fetch_page", fetch)
    service = EventService()
    settings = Settings(events_enabled=True, ticketmaster_api_key="fixture", events_cache_seconds=30)
    first = service.search(settings, "paris", START, END, "ALL")
    assert len(first.events) == 1
    first.events.clear()  # Callers must not be able to corrupt the cache.
    assert len(service.search(settings, "paris", START, END, "ALL").events) == 1
    assert len(calls) == 1
    source.clear()  # Cancelled event disappeared from the refreshed provider result.
    clock[0] += 31
    assert service.search(settings, "paris", START, END, "ALL").status == "EMPTY"
    assert len(calls) == 2


def test_provider_budget_cooldown_and_partial_page_failure(monkeypatch):
    monkeypatch.setattr(service_module, "sleep", lambda _: None)
    calls = []
    def fetch(*args):
        calls.append(args[-1])
        return [normalize_event(raw_event(), CITY, START, END)], True
    monkeypatch.setattr(TicketmasterProvider, "fetch_page", fetch)
    service = EventService()
    settings = Settings(ticketmaster_api_key="fixture", events_daily_request_limit=1)
    assert service.search(settings, "paris", START, END, "ALL").status == "UNAVAILABLE"
    assert service.search(settings, "paris", START, END, "MUSIC").status == "UNAVAILABLE"
    assert calls == [0] and not service.cache


def test_bounded_pages_and_result_limit(monkeypatch):
    monkeypatch.setattr(service_module, "sleep", lambda _: None)
    def fetch(*args):
        items = []
        for i in range(20):
            raw = raw_event()
            raw["id"] = f"event-{args[-1]}-{i}"
            items.append(normalize_event(raw, CITY, START, END))
        return items, True
    monkeypatch.setattr(TicketmasterProvider, "fetch_page", fetch)
    service = EventService()
    result = service.search(Settings(ticketmaster_api_key="fixture"), "paris", START, END, "ALL")
    assert len(result.events) == 12 and result.partial and service.requests == 2


def test_sessions_preserve_products_and_do_not_merge_unknown_venues_or_variants():
    first = normalize_event(raw_event(), CITY, START, END)
    first.venue_id = "venue-1"
    second = first.model_copy(update={"id": "evening", "start_date": END,
                                      "url": "https://www.ticketmaster.fr/event/2",
                                      "price_from": Decimal("25"), "currency": "EUR",
                                      "status": "offsale"})
    other_venue = first.model_copy(update={"id": "other", "venue_id": "venue-2"})
    variant = first.model_copy(update={"id": "weekend", "name": "Concert weekend"})
    unknown = first.model_copy(update={"id": "unknown", "venue_id": None})
    grouped = group_sessions([first, second, other_venue, variant, unknown,
                              unknown.model_copy(update={"id": "unknown-2"})])
    assert len(grouped) == 5
    assert [session.id for session in grouped[0].sessions] == [first.id, "evening"]
    assert grouped[0].sessions[1].url == second.url
    assert grouped[0].sessions[1].price_from == Decimal("25")
    assert grouped[0].sessions[1].status == "offsale"
    assert not first.sessions


def test_grouping_happens_before_card_limit(monkeypatch):
    monkeypatch.setattr(service_module, "sleep", lambda _: None)
    first = normalize_event(raw_event(), CITY, START, END)
    first.venue_id = "venue-1"
    batch = [first.model_copy(update={"id": str(i)}) for i in range(20)]
    batch.append(first.model_copy(update={"id": "different", "name": "Exhibition"}))
    monkeypatch.setattr(TicketmasterProvider, "fetch_page", lambda *args: (batch, False))
    result = EventService().search(Settings(ticketmaster_api_key="fixture"), "paris", START, END, "ALL")
    assert len(result.events) == 2 and not result.partial
    assert len(result.events[0].sessions) == 20


def test_provider_rechecks_category_and_exposes_genre():
    raw = raw_event()
    raw["classifications"][0]["genre"] = {"name": "Jazz"}
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(200, json={
        "page": {"totalPages": 1}, "_embedded": {"events": [raw]},
    }))) as client:
        provider = TicketmasterProvider()
        assert provider.fetch_page(client, "fixture", CITY, START, END, "SPORTS", 0)[0] == []
        assert provider.fetch_page(client, "fixture", CITY, START, END, "MUSIC", 0)[0][0].genre == "Jazz"


def test_api_feature_gate_and_one_way_dates(api_client, isolated_db, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "events_enabled", False)
    assert api_client.get("/api/v1/deals/missing/events").json()["status"] == "DISABLED"
    monkeypatch.setattr(settings, "events_enabled", True)
    monkeypatch.setattr(settings, "ticketmaster_api_key", SecretStr("fixture"))
    deal, _ = catalog_fixture(isolated_db)
    destination = isolated_db.get(Destination, deal.destination_id)
    destination.slug, destination.city, destination.country_code = "paris", "Paris", "FR"
    isolated_db.commit()
    path = f"/api/v1/deals/{deal.slug}/events"
    assert api_client.get(f"/api/v1/deals/{deal.slug}").json()["events_supported"]
    assert api_client.get(path).json()["status"] == "NEEDS_DATES"
    assert api_client.get(path, params={"start_date": str(deal.trip_start)}).status_code == 422
    assert api_client.get(path, params={"start_date": str(deal.trip_start), "end_date": str(deal.trip_start-timedelta(days=1))}).status_code == 422
    observed = []
    def search(*args):
        observed.append(args)
        return EventResults(status="EMPTY")
    monkeypatch.setattr(service_module.event_service, "search", search)
    assert api_client.get(path, params={"start_date": str(deal.trip_start), "end_date": str(deal.trip_end)}).json()["status"] == "EMPTY"
    assert observed[0][1:4] == ("paris", deal.trip_start, deal.trip_end)
    assert api_client.get(path, params={"category": "INVALID"}).status_code == 422
    deal.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    isolated_db.commit()
    assert api_client.get(path).status_code == 404


def test_api_roundtrip_defaults_and_bounds(api_client, isolated_db, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "events_enabled", True)
    monkeypatch.setattr(settings, "ticketmaster_api_key", SecretStr("fixture"))
    deal, component = catalog_fixture(isolated_db)
    destination = isolated_db.get(Destination, deal.destination_id)
    destination.slug, destination.country_code = "paris", "FR"
    offer = TravelOffer(
        data_provider_id=1, external_id="fixture", depart_at=deal.depart_at,
        return_at=deal.depart_at+timedelta(days=3), original_price=200,
        original_currency="PLN", source="fixture",
    )
    isolated_db.add(offer)
    isolated_db.flush()
    component.travel_offer_id = offer.id
    isolated_db.commit()
    observed = []
    def search(*args):
        observed.append(args)
        return EventResults(status="EMPTY")
    monkeypatch.setattr(service_module.event_service, "search", search)
    path = f"/api/v1/deals/{deal.slug}/events"
    assert api_client.get(path).json()["status"] == "EMPTY"
    assert observed[0][2:4] == (deal.trip_start, deal.trip_end)
    assert api_client.get(path, params={"start_date": str(deal.trip_start), "end_date": str(deal.trip_end+timedelta(days=1))}).status_code == 422
    destination.country_code = "US"
    isolated_db.commit()
    assert api_client.get(path).json()["status"] == "UNSUPPORTED"
