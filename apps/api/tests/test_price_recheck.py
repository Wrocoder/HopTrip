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
            'airline':'FR', 'flight_number':'123', 'price':452, 'currency':'PLN'}
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
