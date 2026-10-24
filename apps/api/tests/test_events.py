import logging
from datetime import UTC, date, datetime, timedelta
from urllib.parse import quote

import httpx
import pytest
from app.config import Settings, get_settings
from app.models.location import Destination
from app.providers.ticketmaster import (
    EventsUnavailable,
    TicketmasterProvider,
    normalize_event,
    safe_ticket_url,
)
from app.schemas.deal import FlightFacts
from app.schemas.event import EventResults
from app.services import events as service_module
from app.services.event_destinations import event_cities, event_city
from pydantic import SecretStr
from tests.helpers import catalog_fixture

START, END = date(2099, 10, 24), date(2099, 10, 26)
CITY = event_cities()['paris']


def tracked(target='https://www.ticketmaster.fr/event/1', publisher='7853869'):
    return f'https://ticketmaster.evyy.net/c/{publisher}/123/456?u={quote(target, safe="")}'


def raw_event():
    return {'id': 'one', 'name': 'Concert', 'url': tracked(),
            'dates': {'start': {'localDate': str(START), 'localTime': '20:00:00'},
                      'timezone': 'Europe/Paris', 'status': {'code': 'onsale'}},
            'classifications': [{'segment': {'name': 'Music'}}],
            '_embedded': {'venues': [{'name': 'Venue', 'city': {'name': 'Paris'},
                                     'country': {'countryCode': 'FR'}}]}}


def test_catalog_resolves_all_configured_markets_and_aliases():
    cities = event_cities()
    assert {c.country for c in cities.values()} == set(Settings().events_countries.split(',')) - {'TR'}
    assert event_city('antalya-tr-ayt', 'TR', 'TR', 'Antalya', 'Europe/Istanbul') is not None
    assert event_city('new-city', 'TR', 'TR', 'Example', 'Unknown/Zone') is None
    assert 'Milano' in cities['milan'].names
    assert cities['tromso'].timezone == 'Europe/Oslo'
    assert event_city('paris', 'US', 'FR') is None
    assert event_city('paris', 'FR', 'IT') is None
    assert event_city('not-reviewed', 'FR', 'FR') is None


@pytest.mark.parametrize('url', [
    'https://www.ticketmaster.fr/event/1', tracked(publisher='another'),
    tracked('https://attacker.test/'), tracked('https://www.ticketmaster.fr.attacker.test/'),
    tracked('https://www.ticketmaster.fr@attacker.test/'), tracked('http://www.ticketmaster.fr/event/1'),
    tracked('https://www.ticketmaster.fr/event/1?apikey=secret'),
    tracked('https://www.ticketmaster.fr:444/event/1'),
    tracked() + '&u=https%3A%2F%2Fattacker.test', tracked() + '&apikey=secret',
    'javascript:alert(1)', '',
])
def test_untracked_and_unsafe_urls_rejected(url):
    assert safe_ticket_url(url) is None


def test_tracked_url_preserved():
    link = tracked() + '&partnerpropertyid=9029029'
    assert safe_ticket_url(link) == link


@pytest.mark.parametrize('status', ['offsale', 'cancelled', 'canceled', 'postponed', 'unknown'])
def test_unavailable_status_excluded(status):
    raw = raw_event()
    raw['dates']['status']['code'] = status
    assert normalize_event(raw, CITY, START, END) is None


def test_normalization_dates_geography_and_unknown_price():
    raw = raw_event()
    event = normalize_event(raw, CITY, START, END)
    assert event and event.price_from is None and event.timezone == CITY.timezone
    raw['dates']['start']['timeTBA'] = True
    assert normalize_event(raw, CITY, START, END).local_time is None
    raw['dates']['start']['dateTBD'] = True
    assert normalize_event(raw, CITY, START, END) is None
    for city, country in [('Paris', 'US'), ('Versailles', 'FR')]:
        raw = raw_event()
        raw['_embedded']['venues'][0].update(city={'name': city}, country={'countryCode': country})
        assert normalize_event(raw, CITY, START, END) is None
    raw = raw_event()
    raw['dates']['start']['localDate'] = str(START - timedelta(days=1))
    assert normalize_event(raw, CITY, START, END) is None
    raw['dates']['end'] = {'localDate': str(END)}
    assert normalize_event(raw, CITY, START, END) is not None
    raw['url'] = None
    assert normalize_event(raw, CITY, START, END) is None


def test_provider_request_and_secret_redaction(caplog):
    def respond(request):
        assert request.url.params['countryCode'] == 'FR'
        assert request.url.params['segmentName'] == 'Music'
        assert request.url.params['localStartEndDateTime'] == f'{START}T00:00:00,{END}T23:59:59'
        return httpx.Response(200, json={'page': {'totalPages': 2}, '_embedded': {'events': [raw_event(), {}]}})
    with caplog.at_level(logging.INFO, logger='httpx'), httpx.Client(transport=httpx.MockTransport(respond)) as client:
        events, more = TicketmasterProvider().fetch_page(client, 'never-log-me', CITY, START, END, 'MUSIC', 0)
    assert len(events) == 1 and more
    assert 'never-log-me' not in caplog.text and 'REDACTED' in caplog.text


@pytest.mark.parametrize('status', [302, 401, 403, 429, 500])
def test_provider_failure_sanitized(status):
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(status))) as client:
        with pytest.raises(EventsUnavailable) as exc:
            TicketmasterProvider().fetch_page(client, 'never-log-me', CITY, START, END, 'ALL', 0)
    assert 'never-log-me' not in str(exc.value)


def test_catalogue_rejects_malformed_page_before_replacing_saved_events():
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(
        200, json={'page': {'totalPages': 1}, '_embedded': {'events': [{}]}},
    ))) as client:
        with pytest.raises(EventsUnavailable):
            TicketmasterProvider().fetch_page(client, 'fixture', CITY, START, END, 'ALL', 0, strict=True)


def test_route_gates_dates_and_expired_deal(api_client, isolated_db, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, 'events_enabled', False)
    assert api_client.get('/api/v1/deals/missing/events').json()['status'] == 'DISABLED'
    monkeypatch.setattr(settings, 'events_enabled', True)
    monkeypatch.setattr(settings, 'ticketmaster_api_key', SecretStr('fixture'))
    deal, _ = catalog_fixture(isolated_db)
    path = f'/api/v1/deals/{deal.slug}/events'
    assert api_client.get(f'/api/v1/deals/{deal.slug}').json()['events_supported']
    assert api_client.get(path).json()['status'] == 'NEEDS_DATES'
    assert api_client.get(path, params={'start_date': str(deal.trip_start)}).status_code == 422
    assert api_client.get(path, params={'start_date': str(deal.trip_start), 'end_date': str(deal.trip_start + timedelta(days=31))}).status_code == 422
    monkeypatch.setattr(service_module.event_service, 'search', lambda *args: EventResults(status='EMPTY'))
    assert api_client.get(path, params={'start_date': str(deal.trip_start), 'end_date': str(deal.trip_end)}).json()['status'] == 'EMPTY'
    destination = isolated_db.get(Destination, deal.destination_id)
    destination.country_code = 'EE'
    isolated_db.commit()
    assert api_client.get(path).json()['status'] == 'UNSUPPORTED'
    deal.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    isolated_db.commit()
    assert api_client.get(path).status_code == 404


def test_route_filters_flight_hours_and_uses_destination_dates(api_client, isolated_db, monkeypatch):
    from app.api import events as routes
    from app.services.catalog import serialize_deal
    settings = get_settings()
    monkeypatch.setattr(settings, 'events_enabled', True)
    monkeypatch.setattr(settings, 'ticketmaster_api_key', SecretStr('fixture'))
    deal, _ = catalog_fixture(isolated_db)
    context = serialize_deal(isolated_db, deal)
    context.trip_type = 'ROUND_TRIP'
    context.flight_facts = FlightFacts(
        outbound_arrival=datetime(2099, 10, 24, 22, 30, tzinfo=UTC),
        return_departure=datetime(2099, 10, 25, 15, tzinfo=UTC),
    )
    monkeypatch.setattr(routes, 'serialize_deal', lambda *args: context)
    observed = []
    raw = raw_event()
    raw['dates']['start']['localDate'] = '2099-10-25'
    sample = normalize_event(raw, CITY, START, END)
    from datetime import time
    items = [sample.model_copy(update={'id': str(h), 'local_time': time(h)}) for h in (0, 12, 22)]
    def search(*args):
        observed.append(args)
        return EventResults(status='READY', events=items)
    monkeypatch.setattr(service_module.event_service, 'search', search)
    response = api_client.get(f'/api/v1/deals/{deal.slug}/events')
    assert response.status_code == 200
    assert observed[0][2] == date(2099, 10, 25)
    assert [e['id'] for e in response.json()['events']] == ['12']
