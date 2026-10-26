from dataclasses import replace
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from app.models.affiliate_click import AffiliateClick
from app.models.offer import TravelOffer
from app.services.availability import available_deals_query
from app.services.deals import expire_deals, generate_flight_deal, generate_fresh_deals
from app.services.price_freshness import price_freshness
from app.services.price_lifetime import max_price_age_hours, price_deadline
from helpers import approved_program, catalog_fixture
from sqlalchemy import select
from test_lifecycle import NOW, ingest, setup


@pytest.mark.parametrize('days,hours,deadline_hours', [(2, 6, 6), (7, 6, 6), (8, 24, 24), (30, 24, 24), (31, 48, 24), (60, 48, 48)])
def test_lifetime_changes_with_departure_window(days, hours, deadline_hours):
    departure = NOW + timedelta(days=days)
    assert max_price_age_hours(departure, NOW) == hours
    assert price_deadline(NOW, departure) == NOW + timedelta(hours=deadline_hours)


@pytest.mark.parametrize('days,hours', [(2, 6), (14, 24), (60, 48)])
def test_same_boundary_for_reads_ingestion_regeneration_and_worker(isolated_db, days, hours):
    db = isolated_db
    raw = replace(setup(db), depart_at=NOW + timedelta(days=days))
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    edge = NOW + timedelta(hours=hours)
    assert offer.expires_at.replace(tzinfo=UTC) == edge
    offer.expires_at = None  # Also protect existing records with the old stored TTL.
    deal = generate_flight_deal(db, offer, NOW)
    assert db.scalar(available_deals_query(edge - timedelta(microseconds=1))) == deal
    assert db.scalar(available_deals_query(edge)) is None
    assert price_freshness(deal, offer, NOW).hidden_after == edge
    assert price_freshness(deal, offer, NOW).max_age_hours == hours
    assert expire_deals(db, edge) == 1 and deal.status == 'STALE'
    assert generate_fresh_deals(db, edge) == 0
    assert generate_flight_deal(db, offer, edge).status == 'STALE'


@pytest.mark.parametrize('boundary,age,hours', [(7, 7, 6), (30, 25, 24)])
def test_open_page_deadline_includes_future_shorter_window(isolated_db, boundary, age, hours):
    db = isolated_db
    departure = NOW + timedelta(days=boundary, hours=2)
    observed = NOW - timedelta(hours=age)
    raw = replace(setup(db), depart_at=departure, source_observed_at=observed)
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, NOW)
    edge = NOW + timedelta(hours=2)
    assert price_deadline(observed, departure) == edge
    assert price_freshness(deal, offer, NOW).hidden_after == edge
    assert db.scalar(available_deals_query(edge - timedelta(microseconds=1))) == deal
    assert db.scalar(available_deals_query(edge)) is None
    assert price_freshness(deal, offer, edge).max_age_hours == hours


@pytest.mark.parametrize('date_only', [False, True])
def test_near_departure_expired_price_cannot_be_opened_or_redirected(api_client, isolated_db, date_only):
    db = isolated_db
    deal, _ = catalog_fixture(db, program=approved_program(db), days=2)
    now = datetime.now(UTC)
    deal.last_verified_at = now - timedelta(hours=7)
    if date_only:
        deal.depart_at = None
    db.commit()
    assert api_client.get('/api/v1/deals').json() == []
    assert api_client.get('/api/v1/deals/' + deal.slug).status_code == 404
    assert api_client.get('/go/' + deal.slug + '/flight').status_code == 404
    assert db.scalar(select(AffiliateClick)) is None
    assert price_freshness(deal, now=now).max_age_hours == 6


def test_repeat_cached_price_cannot_restart_short_lifetime(isolated_db):
    db = isolated_db
    raw = replace(setup(db), depart_at=NOW + timedelta(days=2))
    ingest(db, raw, NOW)
    ingest(db, raw, NOW + timedelta(hours=7))
    offer = db.scalar(select(TravelOffer))
    assert offer.last_verified_at.replace(tzinfo=UTC) == NOW
    assert offer.fetched_at.replace(tzinfo=UTC) == NOW + timedelta(hours=7)
    assert generate_flight_deal(db, offer, NOW + timedelta(hours=7)).status == 'EXPIRED'


def test_changed_price_gets_its_own_short_lifetime(isolated_db):
    db = isolated_db
    raw = replace(setup(db), depart_at=NOW + timedelta(days=2), price=Decimal(452))
    ingest(db, raw, NOW)
    offer = db.scalar(select(TravelOffer))
    deal = generate_flight_deal(db, offer, NOW)
    refreshed = NOW + timedelta(hours=7)
    ingest(db, replace(raw, price=Decimal(661)), refreshed)
    assert generate_flight_deal(db, offer, refreshed).status == 'ACTIVE'
    assert deal.flight_price_pln == Decimal(661)
    assert price_freshness(deal, offer, refreshed).hidden_after == refreshed + timedelta(hours=6)
