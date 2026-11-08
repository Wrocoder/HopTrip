"""Synthetic connections, installed only by the explicitly local E2E app."""
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.services.deals import generate_flight_deal
from connection_fixtures import connection_offer
from sqlalchemy import delete, select


def connection_fixtures(db, enabled: bool):
    ids = select(Deal.id).where(Deal.slug.like('connection-fixture-%'))
    db.execute(delete(DealComponent).where(DealComponent.deal_id.in_(ids)))
    db.execute(delete(Deal).where(Deal.slug.like('connection-fixture-%')))
    db.execute(delete(TravelOffer).where(TravelOffer.external_id.like('connection-fixture-%')))
    if not enabled:
        db.commit()
        return
    origin = db.scalar(select(Airport).where(Airport.iata_code == 'WRO'))
    provider = db.scalar(select(DataProvider).limit(1))
    destination = db.scalar(select(Destination).where(Destination.slug == 'connection-fixture'))
    if destination is None:
        destination = Destination(slug='connection-fixture', city='London', country='United Kingdom',
                                  country_code='GB', iata_code='STN')
        db.add(destination)
        db.flush()
    cases = [('long', dict(gap=360)), ('short', dict(gap=45, direction='RETURN')),
             ('night', dict(gap=120, arrival='2030-11-01T23:00:00Z')),
             ('airport', dict(airport='LHR', next_airport='LGW', gap=180)),
             ('zone', dict(airport='ZZZ', gap=400)), ('missing', dict(gap=120))]
    now = datetime.now(UTC)
    for index, (name, params) in enumerate(cases):
        offer = connection_offer(**params)
        offer.data_provider_id, offer.origin_airport_id, offer.destination_id = provider.id, origin.id, destination.id
        offer.external_id = f'connection-fixture-{name}'
        # Keep same-ticket cached-price binding; offer identifiers need not be the ticket ID.
        offer.price_pln = Decimal(200)
        offer.last_verified_at = offer.fetched_at = now
        offer.expires_at = now + timedelta(hours=24)
        if name == 'missing':
            offer.route_details = None
        db.add(offer)
        db.flush()
        deal = generate_flight_deal(db, offer, now)
        assert deal is not None
        deal.slug = f'connection-fixture-{name}'
    db.commit()
