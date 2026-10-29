import importlib.util
from pathlib import Path

import httpx
import pytest
from app.config import Settings
from tests.test_events import END, START, raw_event


@pytest.fixture
def smoke(monkeypatch):
    path = Path(__file__).resolve().parents[3] / 'scripts/verify-ticketmaster-events.py'
    spec = importlib.util.spec_from_file_location('ticketmaster_smoke', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    monkeypatch.setattr(module, 'sleep', lambda _: None)
    return module


def destination(slug='paris'):
    return {'slug': slug, 'country_code': 'FR', 'city': 'Paris', 'timezone': 'Europe/Paris'}


@pytest.mark.parametrize('response,expected', [
    (httpx.Response(200, json={'page': {'totalPages': 1}, '_embedded': {'events': [raw_event()]}}), 'READY'),
    (httpx.Response(200, json={'page': {'totalPages': 0}}), 'EMPTY'),
    (httpx.Response(200, json={'page': {'totalPages': 1}, '_embedded': {'events': [{}]}}), 'UNAVAILABLE'),
    (httpx.Response(429), 'UNAVAILABLE'),
])
def test_smoke_uses_current_trip_dates_and_does_not_hide_bad_pages(smoke, response, expected):
    calls = []

    def respond(request):
        if request.url.path.endswith('/destinations'):
            return httpx.Response(200, json=[destination()])
        if request.url.path.endswith('/deals'):
            assert request.url.params['round_trip'] == 'true'
            return httpx.Response(200, json=[{'trip_start': str(START), 'trip_end': str(END)}])
        calls.append(request)
        assert request.url.host == 'app.ticketmaster.com'
        assert request.url.params['localStartEndDateTime'] == f'{START}T00:00:00,{END}T23:59:59'
        return response

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        report = smoke.check_catalogue(client, 'never-log-smoke', Settings())
    assert len(calls) == 1
    assert next(row for row in report['trips'] if row['city'] == 'paris')['status'] == expected
    assert report['stoppedOnProviderFailure'] == (expected == 'UNAVAILABLE')
    assert 'never-log-smoke' not in str(report)


def test_smoke_stops_after_provider_access_failure(smoke):
    provider_calls = []

    def respond(request):
        if request.url.path.endswith('/destinations'):
            return httpx.Response(200, json=[destination(), {
                'slug': 'london', 'country_code': 'GB', 'city': 'London', 'timezone': 'Europe/London'}])
        if request.url.path.endswith('/deals'):
            return httpx.Response(200, json=[{'trip_start': str(START), 'trip_end': str(END)}])
        provider_calls.append(request)
        return httpx.Response(403)

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        report = smoke.check_catalogue(client, 'fixture', Settings())
    assert len(provider_calls) == 1
    assert report['stoppedOnProviderFailure']
    assert report['trips'][-1] == {'city': 'london', 'status': 'UNAVAILABLE'}


def test_smoke_checks_public_http_status_and_empty_credentials(smoke):
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(503))) as client:
        with pytest.raises(ValueError, match='Empty'):
            smoke.check_catalogue(client, ' ', Settings())
        with pytest.raises(httpx.HTTPStatusError):
            smoke.check_catalogue(client, 'fixture', Settings())
