from dataclasses import replace
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from app.models.affiliate_click import AffiliateClick
from app.models.data_provider import DataProvider
from app.models.offer import PriceObservation, TravelOffer
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.deals import expire_deals, generate_flight_deal, generate_fresh_deals
from app.services.time import utc
from helpers import approved_program, catalog_fixture
from sqlalchemy import select
from test_lifecycle import NOW, ingest, setup


@pytest.mark.parametrize('known', [False, True])
def test_repeat_preserves_observation_and_earliest_expiry_even_if_upstream_removes_it(isolated_db, known):
    db = isolated_db
    raw = replace(setup(db), expires_at=NOW+timedelta(hours=1),
                  source_observed_at=NOW if known else None)
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, NOW)
    ingest(db, replace(raw, expires_at=None), NOW+timedelta(hours=2))
    assert utc(offer.last_verified_at) == NOW
    assert utc(offer.fetched_at) == NOW+timedelta(hours=2)
    assert utc(offer.expires_at) == NOW+timedelta(hours=1)
    assert db.query(PriceObservation).count() == 1
    # The old Deal snapshot is independently gated by the expired linked source.
    assert db.scalar(available_deals_query(NOW+timedelta(hours=2))) is None
    result = serialize_deal(db, deal).price_freshness
    assert result.observed_at == NOW and result.fetched_at == NOW+timedelta(hours=2)
    assert result.observation_basis == ('SOURCE' if known else 'FIRST_SEEN')
    assert result.availability_checked_at is None and result.hidden_after == NOW+timedelta(hours=1)


def test_new_source_observation_can_renew_but_late_delivery_does_not_replace_new_price(isolated_db):
    db = isolated_db
    raw = replace(setup(db), source_observed_at=NOW, expires_at=NOW+timedelta(hours=1))
    ingest(db, raw, NOW)
    renewed = replace(raw, source_observed_at=NOW+timedelta(hours=2), price=Decimal(220), expires_at=None)
    ingest(db, renewed, NOW+timedelta(hours=2))
    ingest(db, raw, NOW+timedelta(hours=3))
    offer = db.scalar(select(TravelOffer))
    assert offer.price_pln == Decimal(220) and utc(offer.last_verified_at) == NOW+timedelta(hours=2)
    assert utc(offer.fetched_at) == NOW+timedelta(hours=3)
    assert utc(offer.expires_at) == NOW+timedelta(hours=50)
    result = serialize_deal(db, generate_flight_deal(db, offer, NOW+timedelta(hours=3))).price_freshness
    assert result.observed_at == NOW+timedelta(hours=2) and result.availability_checked_at is None


def test_exact_48h_boundary_is_identical_for_reads_generation_and_worker(isolated_db):
    db = isolated_db
    raw = setup(db)
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    offer.expires_at = None  # Exercise TTL itself, independently of a stored expires_at.
    deal = generate_flight_deal(db, offer, NOW)
    edge = NOW+timedelta(hours=48)
    assert db.scalar(available_deals_query(edge-timedelta(microseconds=1))) == deal
    assert db.scalar(available_deals_query(edge)) is None
    assert generate_fresh_deals(db, edge) == 0
    assert deal.status == 'STALE'
    assert expire_deals(db, edge) == 0
    assert generate_flight_deal(db, offer, edge).status == 'STALE'


@pytest.mark.parametrize('reason', ['expired','stale','future','departed'])
def test_linked_source_gate_applies_to_list_detail_and_redirect_without_click(api_client, isolated_db, reason):
    db = isolated_db
    program = approved_program(db)
    deal, component = catalog_fixture(db, program=program)
    provider = DataProvider(code='test', name='Test')
    db.add(provider)
    db.flush()
    now = datetime.now(UTC)
    offer = TravelOffer(data_provider_id=provider.id,external_id='gate',source='test',
        original_price=deal.flight_price_pln,original_currency='PLN',price_pln=deal.flight_price_pln,
        depart_at=deal.depart_at,last_verified_at=now)
    if reason == 'expired':
        offer.expires_at = now-timedelta(seconds=1)
    if reason == 'stale':
        offer.last_verified_at = now-timedelta(hours=48)
    if reason == 'future':
        offer.last_verified_at = now+timedelta(hours=1)
    if reason == 'departed':
        offer.depart_at = now-timedelta(seconds=1)
    db.add(offer)
    db.flush()
    component.travel_offer_id = offer.id
    db.commit()
    assert api_client.get('/api/v1/deals').json() == []
    assert api_client.get('/api/v1/deals/'+deal.slug).status_code == 404
    assert api_client.get('/go/'+deal.slug+'/flight').status_code == 404
    assert db.scalar(select(AffiliateClick)) is None


def test_catalogue_reports_current_snapshot_provenance_without_claiming_live_check(api_client, isolated_db):
    db = isolated_db
    raw = setup(db)
    now = datetime.now(UTC)
    raw = replace(raw, depart_at=now+timedelta(days=30), source_observed_at=now-timedelta(hours=3))
    ingest(db, raw, now)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, now)
    data = api_client.get('/api/v1/deals/'+deal.slug).json()['price_freshness']
    assert datetime.fromisoformat(data['observed_at']) == now-timedelta(hours=3)
    assert datetime.fromisoformat(data['fetched_at']) == now
    assert data['observation_basis'] == 'SOURCE' and data['availability_checked_at'] is None
    assert datetime.fromisoformat(data['hidden_after']) == now+timedelta(hours=45)
    # An offer updated ahead of regeneration must not lend provenance to a different snapshot.
    offer.price_pln = Decimal(999)
    db.commit()
    assert serialize_deal(db, deal).price_freshness.observation_basis is None


def test_naive_expiry_is_rejected_instead_of_assuming_a_zone(isolated_db):
    raw = replace(setup(isolated_db), expires_at=datetime(2030,9,2))
    assert ingest(isolated_db, raw, NOW).skipped_invalid_offers == 1
