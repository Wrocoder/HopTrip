import asyncio
from decimal import Decimal

import httpx
import pytest
from app.jobs import check_flight_price
from app.models.offer import TravelOffer
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.services.deals import generate_flight_deal
from sqlalchemy import select
from test_lifecycle import NOW, ingest, setup


@pytest.mark.parametrize('variant,status', [
    ('same', 'CACHE_UNCHANGED'), ('changed', 'CACHE_PRICE_CHANGED'),
    ('other_flight', 'NOT_IN_CACHE_RESPONSE'), ('invalid', 'INCONCLUSIVE'),
    ('currency', 'INCONCLUSIVE'),
])
def test_exact_cached_recheck_preserves_snapshot_and_never_claims_live(isolated_db, monkeypatch, variant, status):
    db = isolated_db
    setup(db)
    item = {'origin':'WRO', 'origin_airport':'WRO', 'destination':'BCN', 'destination_airport':'BCN',
            'departure_at':'2030-10-31T23:30:00Z', 'return_at':'2030-11-04T08:00:00Z',
            'airline':'FR', 'flight_number':'123', 'price':452, 'currency':'PLN',
            'link':'/search/WRO0111BCN04111?t=original-quote'}
    received = []

    def respond(request):
        received.append(dict(request.url.params))
        row = dict(item)
        if variant == 'changed':
            row['price'] = 661
        elif variant == 'other_flight':
            row.update(airline='W6', price=482)
        elif variant == 'invalid':
            row.pop('price')
        elif variant == 'currency':
            row['currency'] = 'EUR'
        return httpx.Response(200, json={'success':True, 'data':[row]})

    provider = TravelpayoutsDataProvider(token='fixture', transport=httpx.MockTransport(respond))
    raw = provider._normalize(item, SearchQuery(origin='WRO'))
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, NOW)
    original = (offer.last_verified_at, offer.fetched_at, offer.price_pln, deal.flight_price_pln)
    monkeypatch.setattr(check_flight_price, 'SessionLocal', lambda: db)
    result = asyncio.run(check_flight_price.check(deal.slug, provider))
    assert result['status'] == status
    assert result['source'] == 'CACHED_DATA_API' and result['live_availability_verified'] is False
    assert received[0]['departure_at'] == '2030-11-01'  # WRO local date, not the UTC day.
    assert received[0]['return_at'] == '2030-11-04' and received[0]['one_way'] == 'false'
    assert received[0]['currency'] == 'pln'
    assert (offer.last_verified_at, offer.fetched_at, offer.price_pln, deal.flight_price_pln) == original
    assert deal.flight_price_pln == Decimal(452)


@pytest.mark.parametrize('variant', ['original_first', 'original_last', 'other_quote', 'missing_ticket',
                                   'conflicting_quotes', 'tracking_changed', 'search_changed'])
def test_recheck_preserves_quote_variants_and_does_not_mistake_another_fare_for_a_price_change(
    isolated_db, monkeypatch, variant,
):
    db = isolated_db
    setup(db)
    original = {'origin':'WRO', 'origin_airport':'WRO', 'destination':'BCN',
        'destination_airport':'BCN', 'departure_at':'2030-11-01T10:00:00Z',
        'return_at':'2030-11-04T08:00:00Z', 'airline':'FR', 'flight_number':'123',
        'price':289, 'currency':'PLN', 'link':'/search/WRO0111BCN04111?t=original-quote'}
    alternative = original | {'price':541, 'link':'/search/WRO0111BCN04111?t=other-quote'}
    rows = [original, alternative]
    if variant == 'original_last':
        rows.reverse()
    elif variant == 'other_quote':
        rows = [alternative]
    elif variant == 'missing_ticket':
        original.pop('link')
        rows = [original]
    elif variant == 'conflicting_quotes':
        rows = [original, original | {'price':541}]
    elif variant == 'tracking_changed':
        rows = [original | {'link':'https://www.aviasales.com/search/WRO0111BCN04111?t=original-quote&marker=updated'}]
    elif variant == 'search_changed':
        rows = [original | {'link':'/search/WRO0211BCN04111?t=original-quote'}]
    provider = TravelpayoutsDataProvider(token='fixture', transport=httpx.MockTransport(
        lambda _: httpx.Response(200, json={'success':True, 'data':rows})))
    ingest(db, provider._normalize(original, SearchQuery(origin='WRO')), NOW)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, NOW)
    before = (offer.last_verified_at, offer.fetched_at, offer.price_pln, offer.raw_payload, deal.flight_price_pln)
    monkeypatch.setattr(check_flight_price, 'SessionLocal', lambda: db)
    result = asyncio.run(check_flight_price.check(deal.slug, provider))
    confirmed = variant in {'original_first', 'original_last', 'tracking_changed'}
    assert result['status'] == ('CACHE_UNCHANGED' if confirmed else 'INCONCLUSIVE')
    assert result['matched_price'] == ('289' if confirmed else None)
    assert result['match_basis'] == ('EXACT_TICKET' if confirmed or variant == 'conflicting_quotes' else 'ITINERARY_ONLY')
    assert result['live_availability_verified'] is False
    assert result['received'] == len(rows)
    assert (offer.last_verified_at, offer.fetched_at, offer.price_pln, offer.raw_payload, deal.flight_price_pln) == before
