"""Read-only smoke check of the real adapter against current HopTrip trip dates.

Run with PYTHONPATH=apps/api. Does not follow affiliate links or print credentials.
"""
import argparse
import json
from datetime import UTC, date, datetime
from pathlib import Path
from ssl import create_default_context
from time import sleep

import httpx
from app.config import Settings
from app.providers.ticketmaster import EventsUnavailable, TicketmasterProvider
from app.services.event_destinations import event_city


def check_catalogue(client, key, settings):
    if not key.strip():
        raise ValueError('Empty Ticketmaster key')
    rows = []
    destinations = client.get('https://hoptrip.pl/api/v1/destinations').raise_for_status().json()
    coverage = []
    for d in destinations:
        city = event_city(d['slug'], d['country_code'], settings.events_countries, d['city'], d.get('timezone'))
        if d['country_code'] in settings.events_countries.split(','):
            coverage.append({'slug': d['slug'], 'supported': city is not None})
    stopped = False
    for slug in ('milan', 'london', 'barcelona', 'oslo', 'paris', 'warsaw'):
        d = next((d for d in destinations if d['slug'] == slug), None)
        city = event_city(slug, d['country_code'], settings.events_countries, d['city'], d.get('timezone')) if d else None
        if not city:
            rows.append({'city': slug, 'status': 'NO_CURRENT_TRIP_OR_MAPPING'})
            continue
        trips = client.get('https://hoptrip.pl/api/v1/deals', params={
            'destination': slug, 'limit': 1, 'round_trip': 'true'}).raise_for_status().json()
        if not trips:
            rows.append({'city': slug, 'status': 'NO_CURRENT_TRIP_OR_MAPPING'})
            continue
        trip = trips[0]
        start, end = date.fromisoformat(trip['trip_start']), date.fromisoformat(trip['trip_end'])
        sleep(1.1)
        try:
            events, more = TicketmasterProvider().fetch_page(
                client, key, city, start, end, 'ALL', 0,
                affiliate_id=settings.ticketmaster_affiliate_id, strict=True)
        except EventsUnavailable:
            rows.append({'city': slug, 'status': 'UNAVAILABLE'})
            stopped = True
            break  # No retries or further provider requests after a failure.
        rows.append({'city': slug, 'tripStart': str(start), 'tripEnd': str(end),
                     'validTrackedEvents': len(events), 'morePages': more,
                     'status': 'READY' if events else 'EMPTY'})
    return {'checkedAtUtc': datetime.now(UTC).isoformat(), 'destinationCoverage': coverage,
            'trips': rows, 'stoppedOnProviderFailure': stopped,
            'note': 'One page per city; EMPTY means no normalized events in this sample, '
                    'not complete city/date coverage. No purchases or redirects.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1]
                        / '.cache/ticketmaster-integration-smoke.json')
    args = parser.parse_args()
    key = (Path.home() / '.hoptrip/ticketmaster.txt').read_text().strip()
    with httpx.Client(verify=create_default_context(), timeout=15, follow_redirects=False) as client:
        report = check_catalogue(client, key, Settings())
    path = args.output
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'mapped': sum(d['supported'] for d in report['destinationCoverage']),
                      'destinations': len(report['destinationCoverage']), 'trips': report['trips']}))
    return 1 if report['stoppedOnProviderFailure'] else 0


if __name__ == '__main__':
    try:
        code = main()
    except Exception:
        # httpx exception strings can contain an apikey URL.
        print('Smoke check failed; error details suppressed to protect credentials.')
        raise SystemExit(1) from None
    raise SystemExit(code)
