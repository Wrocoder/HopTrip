"""Synthetic isolated browser itineraries; no external requests or dispatch."""
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.services.deals import generate_flight_deal
from app.services.flight_routes import ticket_key
from sqlalchemy import delete, select


def weekend_fixtures(db, enabled: bool, *, nights: int | None = None):
    ids = select(Deal.id).where(Deal.slug.like('weekend-fixture-%'))
    db.execute(delete(DealComponent).where(DealComponent.deal_id.in_(ids)))
    db.execute(delete(Deal).where(Deal.slug.like('weekend-fixture-%')))
    db.execute(delete(TravelOffer).where(TravelOffer.external_id.like('weekend-fixture-%')))
    if not enabled:
        db.commit()
        return
    origin = db.scalar(select(Airport).where(Airport.iata_code == 'WRO'))
    provider = db.scalar(select(DataProvider).limit(1))
    destination = db.scalar(select(Destination).where(Destination.slug == 'weekend-fixture'))
    if not destination:
        destination = Destination(slug='weekend-fixture', city='London', country='United Kingdom', country_code='GB', iata_code='STN')
        db.add(destination)
        db.flush()
    now = datetime.now(UTC)
    cases = [
        ('morning', '2030-11-01T08:00:00+01:00', '2030-11-03T19:00:00Z'),
        ('evening', '2030-11-01T18:00:00+01:00', '2030-11-03T19:00:00Z'),
        ('monday', '2030-11-01T18:00:00+01:00', '2030-11-03T23:00:00Z'),
        ('flexible', '2030-11-01T18:00:00+01:00', '2030-11-04T19:00:00Z'),
        ('unknown', '2030-11-01T18:00:00+01:00', '2030-11-03T19:00:00Z'),
        ('dst', '2030-10-25T18:00:00+02:00', '2030-10-27T19:00:00Z'),
    ]
    if nights is not None:
        # Inclusion-copy checks need real timeline facts for same-day/overnight stays.
        back = datetime(2030, 11, 1, 21, tzinfo=UTC) + timedelta(days=nights)
        cases = [('inclusion', '2030-11-01T18:00:00+01:00', back.isoformat())]
    for index, (kind, start, back) in enumerate(cases):
        depart, returning = datetime.fromisoformat(start), datetime.fromisoformat(back)
        arrival, home = depart + timedelta(hours=2), returning + timedelta(hours=2)
        price = Decimal(101 + index)
        link = f'/search/fixture?t=weekend-fixture-{kind}'
        payload = dict(origin='WRO', destination='STN', origin_airport='WRO', destination_airport='STN',
            departure_at=start, return_at=back, return_origin_airport='STN', return_destination_airport='WRO',
            price=str(price), currency='PLN', transfers=0, return_transfers=0, airline='FR', link=link)
        offer = TravelOffer(data_provider_id=provider.id, external_id=f'weekend-fixture-{kind}',
            origin_airport_id=origin.id, destination_id=destination.id, source='travelpayouts_data',
            depart_at=depart.astimezone(UTC), return_at=returning.astimezone(UTC),
            original_price=price, original_currency='PLN', price_pln=price, raw_payload=payload,
            last_verified_at=now, fetched_at=now, expires_at=now + timedelta(hours=24))
        if kind != 'unknown':
            offer.route_details = dict(source='travelpayouts_graphql', ticket_key=ticket_key(link),
                departure_at=start, return_at=home.isoformat(), value=str(price), currency='PLN',
                origin_airport_iata='WRO', destination_airport_iata='STN', segments=[
                    dict(departure_at=start, arrival_at=arrival.isoformat(), flight_legs=[
                        dict(origin='WRO', destination='STN', departure_at=start, arrival_at=arrival.isoformat(), operating_carrier='FR')]),
                    dict(departure_at=back, arrival_at=home.isoformat(), flight_legs=[
                        dict(origin='STN', destination='WRO', departure_at=back, arrival_at=home.isoformat(), operating_carrier='FR')])])
        db.add(offer)
        db.flush()
        deal = generate_flight_deal(db, offer, now)
        deal.slug = f'weekend-fixture-{kind}'
    db.commit()
