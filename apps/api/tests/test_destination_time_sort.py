"""Global airport-window ordering must survive filtering and pagination."""
import pytest
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.schemas.weekend import WorkHours
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.weekend_catalog import itinerary_matches
from sqlalchemy import event, select
from test_weekend_catalog import catalog as catalog


def page(client, **params):
    response = client.get('/api/v1/deals', params={'sort': 'destination_time', 'include_total': 'true', **params})
    assert response.status_code == 200, response.text
    return response.json()


@pytest.mark.parametrize('mode', [None, 'calendar-v1', 'no-leave-v1'])
def test_global_order_before_offset_and_total(api_client, catalog, mode):
    short = catalog(100, back='2030-11-03T16:00:00Z')
    long = catalog(500, back='2030-11-03T19:00:00Z')
    middle = catalog(200, back='2030-11-03T18:00:00Z')
    params = {'weekend_mode': mode} if mode else {}
    expected = [long.id, middle.id, short.id]
    for offset, expected_id in enumerate(expected):
        result = page(api_client, limit=1, offset=offset, **params)
        assert result['total'] == 3
        assert [d['id'] for d in result['items']] == [expected_id]
        assert result['items'][0]['destination_time']['sort_eligible']
    empty = page(api_client, limit=1, offset=3, **params)
    assert empty['items'] == [] and empty['total'] == 3
    plain = api_client.get('/api/v1/deals', params={'sort': 'destination_time', **params}).json()
    assert [d['id'] for d in plain] == expected


def test_estimated_huge_window_and_unknown_follow_known_with_price_fallback(api_client, catalog):
    estimated = catalog(50, kind='estimated', back='2030-11-30T19:00:00Z')
    unknown = catalog(25, kind='unknown')
    known = catalog(900, back='2030-11-01T19:00:00Z')  # Known zero interval.
    result = page(api_client)
    assert [d['id'] for d in result['items']] == [known.id, unknown.id, estimated.id]
    intervals = [d['destination_time'] for d in result['items']]
    assert intervals[0]['airport_interval_minutes'] == 0 and intervals[0]['sort_eligible']
    assert intervals[1]['status'] == 'UNKNOWN' and intervals[2]['status'] == 'ESTIMATED'
    assert not intervals[1]['sort_eligible'] and not intervals[2]['sort_eligible']


def test_all_unknown_or_estimated_use_price_without_dropping_results(api_client, catalog):
    expensive = catalog(300, kind='unknown')
    cheap = catalog(100, kind='estimated')
    result = page(api_client)
    assert result['total'] == 2 and [d['id'] for d in result['items']] == [cheap.id, expensive.id]


def test_equal_intervals_use_price_then_date_then_id(api_client, isolated_db, catalog):
    expensive = catalog(300)
    later = catalog(200, start='2030-11-08T18:00:00+01:00', back='2030-11-10T19:00:00Z')
    first = catalog(200)
    second = catalog(200, start='2030-11-01T18:01:00+01:00', back='2030-11-03T19:01:00Z')
    # Deliberately contradict convenience order with old score.
    expensive.deal_score = 100
    isolated_db.commit()
    assert [d['id'] for d in page(api_client)['items']] == [first.id, second.id, later.id, expensive.id]
    assert api_client.get('/api/v1/deals').json()[0]['id'] == first.id  # Default remains price/date/id.


@pytest.mark.parametrize('damage', ['multiple', 'origin', 'destination', 'source'])
def test_critical_source_cannot_rank_as_reliable(api_client, isolated_db, catalog, damage):
    damaged = catalog(100, back='2030-11-30T19:00:00Z')
    known = catalog(200)
    component = isolated_db.scalar(select(DealComponent).where(DealComponent.deal_id == damaged.id))
    offer = isolated_db.get(TravelOffer, component.travel_offer_id)
    if damage == 'multiple':
        isolated_db.add(DealComponent(deal_id=damaged.id, component_type='FLIGHT',
                                     travel_offer_id=offer.id, price_pln=100))
    elif damage == 'origin':
        offer.raw_payload = {**offer.raw_payload, 'origin_airport': 'KRK', 'origin': 'KRK'}
    elif damage == 'destination':
        offer.raw_payload = {**offer.raw_payload, 'destination_airport': 'BCN', 'destination': 'BCN'}
    else:
        offer.source = 'unsupported-synthetic'
    isolated_db.commit()
    result = page(api_client)
    assert result['total'] == 2 and result['items'][0]['id'] == known.id
    assert not result['items'][1]['destination_time']['sort_eligible']
    assert result['items'][1]['destination_time'] == serialize_deal(isolated_db, damaged).destination_time.model_dump()


@pytest.mark.parametrize('params', [{}, {'weekend_mode': 'calendar-v1'}, {'weekend': 'true'}])
def test_candidate_cap_is_explicit_and_filters_can_narrow_it(api_client, catalog, monkeypatch, params):
    from app.services import weekend_catalog

    catalog(100)
    catalog(200)
    monkeypatch.setattr(weekend_catalog, 'MAX_WEEKEND_CANDIDATES', 1)
    response = api_client.get('/api/v1/deals', params={'sort': 'destination_time', 'limit': 1, **params})
    assert response.status_code == 422
    assert response.json()['detail']['code'] == 'DESTINATION_TIME_QUERY_TOO_BROAD'
    assert page(api_client, budget=100, **params)['total'] == 1
    assert api_client.get('/api/v1/deals?include_total=true').json()['total'] == 2


def test_batched_snapshot_matches_public_serializer_without_n_plus_one(isolated_db, catalog):
    from app.models.location import DestinationAlias

    deals = [catalog(100), catalog(200, kind='estimated'), catalog(300, kind='unknown')]
    for index in range(5):
        isolated_db.add(DestinationAlias(destination_id=deals[0].destination_id,
            provider_code=f'test-window-{index}', code='LON', kind='CITY'))
    isolated_db.commit()
    statements = []

    def record(*args):
        statements.append(args[2])

    engine = isolated_db.get_bind()
    event.listen(engine, 'before_cursor_execute', record)
    try:
        matches = itinerary_matches(isolated_db, available_deals_query().order_by(None), None, WorkHours())
    finally:
        event.remove(engine, 'before_cursor_execute', record)
    assert len(statements) == 1 and len(matches) == 3  # Alias fanout never duplicates deals.
    for deal, weekend, interval in matches:
        public = serialize_deal(isolated_db, deal)
        assert interval == public.destination_time and weekend == public.weekend_assessment
