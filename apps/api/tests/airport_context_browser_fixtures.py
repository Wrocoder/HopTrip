"""Synthetic E2E-only offers and a stale editorial record; no external calls."""
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.schemas.airport_context import AirportCityRecord
from app.services.airport_context import registry
from app.services.deals import generate_flight_deal
from app.services.flight_routes import ticket_key
from sqlalchemy import delete, select


def airport_context_fixtures(db, enabled: bool):
    ids = select(Deal.id).where(Deal.slug.like('airport-context-fixture-%'))
    db.execute(delete(DealComponent).where(DealComponent.deal_id.in_(ids)))
    db.execute(delete(Deal).where(Deal.slug.like('airport-context-fixture-%')))
    db.execute(delete(TravelOffer).where(TravelOffer.external_id.like('airport-context-fixture-%')))
    registry().pop(('BGY', 'airport-context-fixture-stale'), None)
    if not enabled:
        db.commit()
        return
    registry()[('BGY', 'airport-context-fixture-stale')] = AirportCityRecord(
        airport='BGY', destination_slug='airport-context-fixture-stale', target_city='Milan', distance_km=45,
        source='https://www.milanbergamoairport.it/en/airport-infrastructure/', last_verified_at=date(2020, 1, 1))
    origin = db.scalar(select(Airport).where(Airport.iata_code == 'WRO'))
    provider = db.scalar(select(DataProvider).limit(1))
    cases = [
        ('remote', 'milan', 'MIL', 'Milan', 'BGY', 'MXP'),
        ('paris', 'paris', 'PAR', 'Paris', 'BVA', 'BVA'),
        ('near', 'bergamo', 'BGY', 'Bergamo', 'BGY', 'BGY'),
        ('unknown', 'london', 'LON', 'London', 'LCY', 'LCY'),
        ('stale', 'airport-context-fixture-stale', 'MIL', 'Milan', 'BGY', 'BGY'),
        ('estimated', 'milan', 'MIL', 'Milan', 'BGY', 'BGY'),
    ]
    now = datetime.now(UTC)
    for index, (kind, slug, code, city, arrival_airport, back_airport) in enumerate(cases):
        destination = db.scalar(select(Destination).where(Destination.slug == slug))
        if not destination:
            destination = Destination(slug=slug, city=city, country='Synthetic E2E', country_code='IT', iata_code=code)
            db.add(destination)
            db.flush()
        start, back = datetime(2030, 11, 8, 19, 30, tzinfo=UTC), datetime(2030, 11, 10, 6, tzinfo=UTC)
        arrival, home = start + timedelta(hours=2), back + timedelta(hours=2)
        price = Decimal(130 + index)
        key = f'airport-context-fixture-{kind}'
        link = f'/search/fixture?t={key}'
        payload = dict(origin='WRO', destination=code, origin_airport='WRO', destination_airport=arrival_airport,
            departure_at=start.isoformat(), return_at=back.isoformat(), return_origin_airport=back_airport,
            return_destination_airport='WRO', price=str(price), currency='PLN', transfers=0, return_transfers=0,
            airline='FR', link=link, duration_to=120, duration_back=120)
        offer = TravelOffer(data_provider_id=provider.id, external_id=key, source='travelpayouts_data',
            origin_airport_id=origin.id, destination_id=destination.id, depart_at=start, return_at=back,
            original_price=price, original_currency='PLN', price_pln=price, raw_payload=payload,
            last_verified_at=now, fetched_at=now, expires_at=now + timedelta(hours=24))
        if kind != 'estimated':
            offer.route_details = dict(source='travelpayouts_graphql', ticket_key=ticket_key(link),
                departure_at=start.isoformat(), return_at=home.isoformat(), value=str(price), currency='PLN',
                origin_airport_iata='WRO', destination_airport_iata=arrival_airport, segments=[
                    dict(departure_at=start.isoformat(), arrival_at=arrival.isoformat(), flight_legs=[
                        dict(origin='WRO', destination=arrival_airport, departure_at=start.isoformat(), arrival_at=arrival.isoformat(), operating_carrier='FR')]),
                    dict(departure_at=back.isoformat(), arrival_at=home.isoformat(), flight_legs=[
                        dict(origin=back_airport, destination='WRO', departure_at=back.isoformat(), arrival_at=home.isoformat(), operating_carrier='FR')])])
        db.add(offer)
        db.flush()
        deal = generate_flight_deal(db, offer, now)
        deal.slug = key
    db.commit()
