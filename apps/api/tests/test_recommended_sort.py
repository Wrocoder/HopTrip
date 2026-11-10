import pytest
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.schemas.weekend import WorkHours
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.weekend_catalog import ranked_itinerary_matches
from sqlalchemy import event, select
from test_weekend_catalog import catalog as catalog


def page(client, **params):
    response = client.get('/api/v1/deals', params={'sort': 'recommended', 'include_total': 'true', **params})
    assert response.status_code == 200, response.text
    return response.json()


def source(db, deal):
    component = db.scalar(select(DealComponent).where(DealComponent.deal_id == deal.id))
    return db.get(TravelOffer, component.travel_offer_id)


def test_global_recommended_ranking_is_separate_from_price_history_and_before_pagination(api_client, isolated_db, catalog):
    partial = catalog(50, kind='unknown')
    leave = catalog(100, start='2030-11-01T08:00:00+01:00')
    good = catalog(300)
    critical = catalog(10)
    source(isolated_db, critical).source = 'unsupported'
    partial.deal_score, good.deal_score = 100, 0
    isolated_db.commit()
    expected = [good.id, leave.id, partial.id, critical.id]
    for offset, expected_id in enumerate(expected):
        result = page(api_client, limit=1, offset=offset)
        assert result['total'] == 4 and result['items'][0]['id'] == expected_id
        row = result['items'][0]
        assert row['trip_quality_score'] == row['trip_quality']['score']
        detail = api_client.get(f'/api/v1/deals/{row["slug"]}').json()
        assert row['trip_quality'] == detail['trip_quality']
    assert page(api_client, limit=1, offset=4)['items'] == []
    assert page(api_client, limit=1, offset=4)['total'] == 4
    assert [d['id'] for d in api_client.get('/api/v1/deals?sort=recommended').json()] == expected
    assert api_client.get('/api/v1/deals?sort=price').json()[0]['id'] == critical.id
    assert api_client.get('/api/v1/deals?sort=score').json()[0]['id'] == partial.id
    assert api_client.get('/api/v1/deals').json()[0]['id'] == critical.id


def test_price_changes_only_tie_breaks_and_never_rescores_historical_data(api_client, isolated_db, catalog):
    first, second = catalog(200), catalog(100)
    before = [(d.deal_score, d.score_components, d.score_version) for d in (first, second)]
    result = page(api_client)
    assert [d['id'] for d in result['items']] == [second.id, first.id]
    assert result['items'][0]['trip_quality_score'] == result['items'][1]['trip_quality_score']
    assert [(d.deal_score, d.score_components, d.score_version) for d in (first, second)] == before


def test_independent_suitability_precedes_a_high_numeric_score_without_hiding_catalog_rows(
        api_client, isolated_db, catalog, monkeypatch):
    from copy import deepcopy

    from app.config import get_settings
    from app.schemas.trip_quality import TripQualityPolicy, TripQualityWeights

    planning = catalog(300, start='2030-11-01T08:00:00+01:00')
    early_return = catalog(100, back='2030-11-03T06:00:00Z')
    for deal in (planning, early_return):
        offer = source(isolated_db, deal)
        offer.raw_payload = {**offer.raw_payload, 'return_origin_airport': 'STN'}
        details = deepcopy(offer.route_details)
        details['segments'][1]['flight_legs'][0]['origin'] = 'STN'
        offer.route_details = details
    monkeypatch.setattr(get_settings(), 'trip_quality_policy', TripQualityPolicy(
        weights=TripQualityWeights(completeness=0, travel=0, usable_time=0,
            connections=0, airports=0, leave=100)))
    isolated_db.commit()
    result = page(api_client, limit=1)
    assert result['total'] == 2 and result['items'][0]['id'] == planning.id
    assert result['items'][0]['trip_quality_score'] == 0
    assert result['items'][0]['trip_quality']['recommendation']['planning_eligible']
    second = page(api_client, limit=1, offset=1)['items'][0]
    assert second['id'] == early_return.id and second['trip_quality_score'] == 100
    assert not second['trip_quality']['recommendation']['planning_eligible']
    assert api_client.get('/api/v1/deals?sort=price').json()[0]['id'] == early_return.id


@pytest.mark.parametrize('mode', [None, 'calendar-v1', 'no-leave-v1'])
def test_filters_intersect_and_custom_work_hours_reach_model(api_client, catalog, mode):
    normal = catalog(200)
    early = catalog(100, start='2030-11-01T16:00:00+01:00')
    params = {'weekend_mode': mode} if mode else {}
    result = page(api_client, **params)
    assert result['total'] == (1 if mode == 'no-leave-v1' else 2)
    assert result['items'][0]['id'] == normal.id
    assert page(api_client, budget=150, **params)['total'] == (0 if mode == 'no-leave-v1' else 1)
    custom = page(api_client, weekend_mode='no-leave-v1', work_start='07:00', work_end='15:00')
    assert custom['total'] == 2
    row = next(d for d in custom['items'] if d['id'] == early.id)
    assert row['weekend_assessment']['might_require_leave'] is False
    assert next(c for c in row['trip_quality']['components'] if c['key'] == 'leave')['points'] == 10


def test_unknown_scores_are_retained_with_price_fallback_and_zero_is_a_real_score(api_client, isolated_db, catalog, monkeypatch):
    from app.config import get_settings
    from app.schemas.trip_quality import TripQualityPolicy, TripQualityWeights

    unscored = catalog(20)
    source(isolated_db, unscored).source = 'unsupported'
    zero = catalog(100, start='2030-11-01T08:00:00+01:00')
    monkeypatch.setattr(get_settings(), 'trip_quality_policy', TripQualityPolicy(weights=TripQualityWeights(
        completeness=0, travel=0, usable_time=0, connections=0, airports=0, leave=100)))
    isolated_db.commit()
    result = page(api_client)
    assert [d['id'] for d in result['items']] == [zero.id, unscored.id]
    assert result['items'][0]['trip_quality_score'] == 0
    assert result['items'][1]['trip_quality_score'] is None


def test_cap_is_explicit_and_narrowing_preserves_total(api_client, catalog, monkeypatch):
    from app.services import weekend_catalog

    catalog(100)
    catalog(200)
    monkeypatch.setattr(weekend_catalog, 'MAX_WEEKEND_CANDIDATES', 1)
    response = api_client.get('/api/v1/deals?sort=recommended&limit=1')
    assert response.status_code == 422 and response.json()['detail']['code'] == 'TRIP_QUALITY_QUERY_TOO_BROAD'
    assert page(api_client, budget=100)['total'] == 1
    assert api_client.get('/api/v1/deals?include_total=true').json()['total'] == 2


def test_one_batched_snapshot_no_n_plus_one_and_serializer_agreement(isolated_db, catalog):
    from app.models.location import DestinationAlias

    first = catalog(100)
    catalog(200, kind='unknown')
    for index in range(4):
        isolated_db.add(DestinationAlias(destination_id=first.destination_id,
            provider_code=f'trip-quality-test-{index}', code='LON', kind='CITY'))
    isolated_db.commit()
    statements = []
    engine = isolated_db.get_bind()

    def record(*args):
        statements.append(args[2])

    event.listen(engine, 'before_cursor_execute', record)
    try:
        matches = ranked_itinerary_matches(isolated_db, available_deals_query().order_by(None), None, WorkHours())
    finally:
        event.remove(engine, 'before_cursor_execute', record)
    assert len(statements) == 1 and len(matches) == 2
    for deal, weekend, interval, ranking in matches:
        public = serialize_deal(isolated_db, deal)
        assert ranking == public.trip_quality and public.trip_quality_score == ranking.score
        assert interval == public.destination_time and weekend == public.weekend_assessment


@pytest.mark.parametrize('damage', ['multiple', 'origin', 'destination', 'source'])
def test_critical_context_never_gets_an_optimistic_numeric_rank(api_client, isolated_db, catalog, damage):
    broken, valid = catalog(100), catalog(200)
    offer = source(isolated_db, broken)
    if damage == 'multiple':
        isolated_db.add(DealComponent(deal_id=broken.id, component_type='FLIGHT', travel_offer_id=offer.id, price_pln=100))
    elif damage == 'origin':
        offer.raw_payload = {**offer.raw_payload, 'origin': 'KRK', 'origin_airport': 'KRK'}
    elif damage == 'destination':
        offer.raw_payload = {**offer.raw_payload, 'destination': 'BCN', 'destination_airport': 'BCN'}
    else:
        offer.source = 'unsupported'
    isolated_db.commit()
    result = page(api_client)
    assert result['total'] == 2 and [d['id'] for d in result['items']] == [valid.id, broken.id]
    assert result['items'][1]['trip_quality_score'] is None
