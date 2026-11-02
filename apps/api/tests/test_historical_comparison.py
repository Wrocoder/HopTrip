"""Synthetic validation of the historical sample and stored score methodology."""

from dataclasses import replace
from datetime import datetime, timedelta
from decimal import Decimal

import pytest
from app.models.data_provider import DataProvider
from app.models.deal import Deal
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation, TravelOffer
from app.models.statistics import RouteStatistics
from app.services.catalog import serialize_deal
from app.services.deals import generate_flight_deal
from app.services.score_explanation import explain_score
from app.services.scoring import SCORE_VERSION, score_flight_deal
from app.services.statistics import recalculate_route_statistics
from sqlalchemy import select
from test_lifecycle import NOW, setup
from test_lifecycle import ingest as ingest_fixture


def observation(db, price, **changes):
    values = dict(data_provider_id=1, origin_airport_id=1, destination_id=1,
                  product_type="FLIGHT", departure_date=NOW.date(), trip_duration_days=3,
                  observed_price_pln=Decimal(price), original_price=Decimal(price),
                  original_currency="PLN", source="test", observed_at=NOW - timedelta(days=1))
    values.update(changes)
    db.add(PriceObservation(**values))


@pytest.mark.parametrize("prices,median,p25,p75", [
    ([200], "200", "200", "200"),
    ([500, 100, 300], "300", "200", "400"),
    ([400, 100, 300, 200], "250", "175", "325"),
    ([100, 100, 100, 100], "100", "100", "100"),
    (["1.00", "1.01"], "1.01", "1.00", "1.01"),
])
def test_median_and_interpolated_quartiles_with_grosz_rounding(
    isolated_db, prices, median, p25, p75
):
    setup(isolated_db)
    for price in prices:
        observation(isolated_db, price)
    isolated_db.commit()
    assert recalculate_route_statistics(isolated_db, now=NOW) == 1
    stats = isolated_db.scalar(select(RouteStatistics))
    assert stats.sample_count == len(prices)
    assert stats.median_price_pln == Decimal(median)
    assert (stats.p25_price_pln, stats.p75_price_pln) == (Decimal(p25), Decimal(p75))


@pytest.mark.parametrize("bad", ["zero", "negative", "future", "missing_route", "negative_duration"])
def test_invalid_history_does_not_inflate_the_comparison(isolated_db, bad):
    db = isolated_db
    setup(db)
    observation(db, 200)
    patch = {"observed_price_pln": Decimal(0)} if bad == "zero" else {
        "observed_price_pln": Decimal(-100)} if bad == "negative" else {
        "observed_at": NOW + timedelta(seconds=1)} if bad == "future" else {
        "origin_airport_id": None} if bad == "missing_route" else {"trip_duration_days": -1}
    observation(db, 10000, **patch)
    db.commit()
    assert recalculate_route_statistics(db, now=NOW) == 1
    stats = db.scalar(select(RouteStatistics))
    assert stats.sample_count == 1 and stats.median_price_pln == 200
    assert db.query(PriceObservation).count() == 2  # Invalid history is retained, not silently deleted.


def test_empty_eligible_cohort_invalidates_its_derived_cache(isolated_db):
    db = isolated_db
    setup(db)
    observation(db, 1000)
    db.commit()
    recalculate_route_statistics(db, now=NOW)
    db.scalar(select(PriceObservation)).observed_at = NOW + timedelta(days=1)
    db.commit()
    recalculate_route_statistics(db, now=NOW)
    stats = db.scalar(select(RouteStatistics))
    assert stats.sample_count == 0 and stats.confidence == 0
    assert db.query(PriceObservation).count() == 1


@pytest.mark.parametrize("count", [0, 1, 4])
def test_insufficient_history_has_no_discount_claim_even_in_legacy_api_fields(count):
    score = score_flight_deal(current_price=Decimal(1), baseline_price=Decimal(1000),
        sample_count=count, observed_at=NOW, expires_at=None, now=NOW)
    assert score.breakdown.status == "PROVISIONAL"
    assert score.discount_percent == 0 and score.breakdown.price_difference_percent is None


@pytest.mark.parametrize("corrupt", ["points", "percentage", "sample_status", "snapshot_price"])
def test_internally_consistent_but_false_snapshot_is_not_explained_as_current(corrupt):
    score = score_flight_deal(current_price=Decimal(200), baseline_price=Decimal(400),
        sample_count=30, observed_at=NOW, expires_at=None, now=NOW)
    data = score.breakdown.model_dump(mode="json")
    number = score.deal_score
    price = Decimal(200)
    if corrupt == "points":
        data["parts"][0]["points"] = "59"
        data["total_before_rounding"] = "99"
        number = 99
    elif corrupt == "percentage":
        data["price_difference_percent"] = "90"
    elif corrupt == "sample_status":
        data["sample_count"] = 4
    else:
        price = Decimal(300)
    deal = Deal(deal_score=number, score_version=SCORE_VERSION, flight_price_pln=price,
                historical_baseline_pln=400, score_components={"breakdown": data})
    assert explain_score(deal).status == "UNAVAILABLE"


@pytest.mark.parametrize("change", [
    {"data_provider_id": 2}, {"origin_airport_id": 2}, {"destination_id": 2},
    {"product_type": "HOTEL"}, {"departure_date": (NOW + timedelta(days=30)).date()},
    {"trip_duration_days": None}, {"trip_duration_days": 0}, {"trip_duration_days": 4},
])
def test_only_the_defined_route_month_and_trip_bucket_is_compared(isolated_db, change):
    db = isolated_db
    setup(db)
    db.add_all([DataProvider(id=2, code="other", name="Other fixture"),
                Airport(id=2, iata_code="KRK", name="KRK", city="Krakow", country_code="PL"),
                Destination(id=2, city="Other", country="Spain", country_code="ES", slug="other")])
    observation(db, 200, expires_at=NOW - timedelta(days=1))
    observation(db, 1000, **change)
    db.commit()
    assert recalculate_route_statistics(db, now=NOW) == 2
    rows = list(db.scalars(select(RouteStatistics)))
    assert sorted(row.median_price_pln for row in rows) == [Decimal(200), Decimal(1000)]
    assert all(row.sample_count == 1 for row in rows)


def test_unverified_cache_is_not_certified_by_merely_generating_a_deal(isolated_db):
    db = isolated_db
    raw = setup(db)
    ingest_fixture(db, raw, NOW)
    stored = db.scalar(select(TravelOffer))
    for _ in range(5):
        observation(db, 1000, departure_date=raw.depart_at.date(), trip_duration_days=None)
    db.commit()
    recalculate_route_statistics(db, now=NOW)
    stats = db.scalar(select(RouteStatistics))
    stats.methodology_version = None
    db.commit()
    deal = generate_flight_deal(db, stored, NOW)
    assert deal.historical_baseline_pln is None and deal.discount_percent == 0
    assert serialize_deal(db, deal).discount_percent is None
    recalculate_route_statistics(db, now=NOW)
    deal = generate_flight_deal(db, stored, NOW)
    assert deal.historical_baseline_pln == 1000
    assert serialize_deal(db, deal).score_explanation.status == "CURRENT"
    stats.calculated_at = NOW + timedelta(hours=1)
    db.commit()
    assert generate_flight_deal(db, stored, NOW).historical_baseline_pln is None


def test_offsets_and_month_boundary_have_one_consistent_utc_cohort(isolated_db):
    db = isolated_db
    raw = replace(setup(db), depart_at=datetime.fromisoformat("2030-10-01T00:30:00+02:00"),
                  return_at=datetime.fromisoformat("2030-10-02T12:00:00+02:00"))
    ingest_fixture(db, raw, NOW)
    db.expire_all()
    stored = db.scalar(select(TravelOffer))
    row = db.scalar(select(PriceObservation))
    assert row.departure_date.isoformat() == "2030-09-30" and row.trip_duration_days == 2
    assert stored.depart_at.hour == 22
    recalculate_route_statistics(db, now=NOW)
    stats = db.scalar(select(RouteStatistics))
    assert stats.departure_month == "2030-09" and stats.trip_duration_days == 2
    assert generate_flight_deal(db, stored, NOW).historical_baseline_pln == 200


def test_expired_history_and_sample_count_cap_remain_part_of_the_recorded_method(isolated_db):
    db = isolated_db
    setup(db)
    for _ in range(31):
        observation(db, 200, expires_at=NOW - timedelta(days=1))
    db.commit()
    recalculate_route_statistics(db, now=NOW)
    stats = db.scalar(select(RouteStatistics))
    assert stats.sample_count == 31 and stats.confidence == 1


def test_saved_calculation_time_is_used_instead_of_rescoring_today():
    score = score_flight_deal(current_price=Decimal(330), baseline_price=Decimal(400),
        sample_count=24, observed_at=NOW - timedelta(hours=24), expires_at=None, now=NOW)
    deal = Deal(deal_score=score.deal_score, score_version=SCORE_VERSION,
                score_components={"breakdown": score.breakdown.model_dump(mode="json")})
    assert explain_score(deal) == score.breakdown
    deal.score_version = "flight-v3"
    assert explain_score(deal).status == "UNAVAILABLE"
