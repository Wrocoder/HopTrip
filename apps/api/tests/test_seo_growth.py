from datetime import UTC, datetime

import pytest
from app.models.data_provider import DataProvider
from app.models.deal import Deal
from app.models.location import Airport
from app.models.offer import TravelOffer
from app.services.deals import generate_flight_deal
from app.services.trip_dates import trip_dates
from helpers import catalog_fixture


@pytest.mark.parametrize('departure,return_at,expected', [
    ('2030-05-02T22:30:00Z', '2030-05-04T22:30:00Z', ('2030-05-03', '2030-05-05')),
    ('2030-03-28T23:30:00Z', '2030-03-31T01:30:00Z', ('2030-03-29', '2030-03-31')),
    ('2030-10-24T22:30:00Z', '2030-10-27T01:30:00Z', ('2030-10-25', '2030-10-27')),
    ('2030-05-03T12:00:00Z', '2030-05-05T22:30:00Z', ('2030-05-03', '2030-05-06')),
])
def test_local_dates_midnight_and_dst(departure, return_at, expected):
    offer = TravelOffer(source='travelpayouts_data', product_type='FLIGHT', departure_precision='TIME',
                        depart_at=datetime.fromisoformat(departure), return_at=datetime.fromisoformat(return_at),
                        raw_payload={'origin_airport': 'KRK', 'destination_airport': 'CIA',
                                     'return_origin_airport': 'CIA', 'return_destination_airport': 'KRK',
                                     'departure_at': departure, 'return_at': return_at, 'return_departure_at': return_at})
    assert tuple(d.isoformat() for d in trip_dates(offer)) == expected


def test_unknown_return_stays_unknown():
    offer = TravelOffer(source='fixture', depart_at=datetime(2030, 5, 3, tzinfo=UTC), return_at=None)
    assert trip_dates(offer)[1] is None


@pytest.mark.parametrize('return_at,expected', [
    ('2030-05-04T22:30:00Z', True), ('2030-05-05T22:30:00Z', False),
])
def test_generated_local_dates_drive_weekend_and_nights(api_client, isolated_db, return_at, expected):
    original, _ = catalog_fixture(isolated_db)
    provider = DataProvider(code='growth-date', name='Date fixture')
    isolated_db.add(provider)
    isolated_db.flush()
    offer = TravelOffer(data_provider_id=provider.id, external_id='date-test', source='travelpayouts_data',
                        product_type='FLIGHT', departure_precision='TIME',
                        origin_airport_id=original.origin_airport_id, destination_id=original.destination_id,
                        depart_at=datetime(2030, 5, 2, 22, 30, tzinfo=UTC),
                        return_at=datetime.fromisoformat(return_at),
                        original_price=100, original_currency='PLN', price_pln=100,
                        last_verified_at=datetime.now(UTC), raw_payload={
                            'origin_airport': 'WRO', 'destination_airport': 'BCN',
                            'return_origin_airport': 'BCN', 'return_destination_airport': 'WRO',
                            'departure_at': '2030-05-02T22:30:00Z', 'return_at': return_at, 'return_departure_at': return_at})
    isolated_db.add(offer)
    isolated_db.flush()
    generated = generate_flight_deal(isolated_db, offer)
    assert generated.trip_start.isoformat() == '2030-05-03'
    assert generated.nights == (2 if expected else 3)
    results = api_client.get('/api/v1/deals?weekend=true&departure_from=2030-05-03&departure_to=2030-05-03').json()
    assert [item['slug'] for item in results] == ([generated.slug] if expected else [])
    results = api_client.get('/api/v1/deals?round_trip=true&duration_min=2&duration_max=4').json()
    assert [item['slug'] for item in results] == [generated.slug]


def test_return_calendar_uses_its_own_airport_zone_not_outbound_destination():
    # London and Tokyo have different calendar dates at this instant.
    offer = TravelOffer(source='travelpayouts_data', product_type='FLIGHT', departure_precision='TIME',
        depart_at=datetime(2030, 5, 2, 10, tzinfo=UTC),
        return_at=datetime(2030, 5, 4, 22, 30, tzinfo=UTC),
        raw_payload={'origin_airport':'WRO', 'destination_airport':'STN',
                     'return_origin_airport':'NRT', 'return_destination_airport':'WRO',
                     'departure_at':'2030-05-02T10:00:00Z', 'return_at':'2030-05-04T22:30:00Z', 'return_departure_at':'2030-05-04T22:30:00Z'})
    assert trip_dates(offer)[1].isoformat() == '2030-05-05'
    offer.raw_payload = {key:value for key,value in offer.raw_payload.items()
                         if key not in {'return_origin_airport', 'return_destination_airport'}}
    assert trip_dates(offer)[1].isoformat() == '2030-05-04'


def test_warsaw_union_filters_total_and_pagination(api_client, isolated_db):
    deal, _ = catalog_fixture(isolated_db)
    for index, code in enumerate(['WAW', 'WMI']):
        airport = Airport(iata_code=code, city='Warszawa', name=code, country_code='PL')
        isolated_db.add(airport)
        isolated_db.flush()
        isolated_db.add(Deal(slug=code.lower(), origin_airport_id=airport.id,
                            destination_id=deal.destination_id, trip_start=deal.trip_start,
                            trip_end=deal.trip_end, nights=2 + index, travelers=1,
                            depart_at=deal.depart_at, flight_price_pln=100 + index,
                            total_estimated_pln=100 + index, price_per_person_pln=100 + index,
                            deal_score=70, confidence=0, last_verified_at=deal.last_verified_at, expires_at=deal.expires_at))
    isolated_db.commit()
    params = {'origin': 'WAW,WMI', 'include_total': 'true', 'sort': 'price', 'limit': 1}
    first = api_client.get('/api/v1/deals', params=params).json()
    assert first['total'] == 2
    assert first['items'][0]['origin_code'] == 'WAW'
    second = api_client.get('/api/v1/deals', params={**params, 'offset': 1}).json()
    assert second['total'] == 2
    assert second['items'][0]['origin_code'] == 'WMI'
    assert api_client.get('/api/v1/deals', params={**params, 'budget': 100}).json()['total'] == 1
    assert api_client.get('/api/v1/deals', params={**params, 'duration_max': 2}).json()['total'] == 1
    assert api_client.get('/api/v1/deals', params={**params, 'origin': 'WAW'}).json()['total'] == 1
    assert api_client.get('/api/v1/deals', params={**params, 'origin': 'WMI,WAW'}).json()['total'] == 2
    assert api_client.get('/api/v1/deals?origin=WRO,KRK').status_code == 404


@pytest.mark.parametrize('event', ['BUDGET_USE', 'TRIP_SAVE', 'ALERT_CONFIRMED'])
def test_growth_events_are_accepted_without_private_context(api_client, event):
    response = api_client.post('/api/v1/analytics/events', json={
        'event_name': event, 'anonymous_session_id': 'test-session',
        'metadata': {'page_type': 'city_break'},
    })
    assert response.status_code == 202
