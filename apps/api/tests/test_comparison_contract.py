"""H3-04a: public comparisons must belong to the price actually returned."""

import json
from decimal import Decimal
from pathlib import Path

import pytest
from app.services.scoring import SCORE_VERSION, score_flight_deal
from helpers import catalog_fixture

REFERENCE = json.loads((Path(__file__).parent / "fixtures/h3-price-comparisons.json").read_text())


def scored_deal(db, *, price="200", baseline=Decimal(400), count=30):
    deal, _ = catalog_fixture(db, price=price)
    score = score_flight_deal(
        current_price=Decimal(price), baseline_price=baseline, sample_count=count,
        observed_at=deal.last_verified_at, expires_at=deal.expires_at,
        now=deal.last_verified_at,
    )
    deal.score_version = SCORE_VERSION
    deal.deal_score = score.deal_score
    deal.historical_baseline_pln = baseline
    deal.score_components = {"sample_count": count, "breakdown": score.breakdown.model_dump(mode="json")}
    deal.discount_percent = score.discount_percent
    db.commit()
    return deal


@pytest.mark.parametrize("corruption", [
    "missing_flight_price", "missing_median", "different_display_price",
    "different_median", "non_object", "string", "number",
])
def test_inconsistent_comparison_is_neutral_on_every_catalog_route(api_client, isolated_db, corruption):
    deal = scored_deal(isolated_db)
    if corruption == "missing_flight_price":
        deal.flight_price_pln = None
    elif corruption == "missing_median":
        deal.historical_baseline_pln = None
    elif corruption == "different_display_price":
        deal.price_per_person_pln = Decimal(300)
    elif corruption == "different_median":
        deal.historical_baseline_pln = Decimal(500)
    else:
        deal.score_components = {"non_object": ["invalid"], "string": "invalid", "number": 42}[corruption]
    isolated_db.commit()
    for path in [
        f"/api/v1/deals/{deal.slug}", "/api/v1/deals", "/api/v1/deals?include_total=true",
        "/api/v1/departures/WRO/deals", "/api/v1/destinations/barcelona/deals",
    ]:
        response = api_client.get(path)
        assert response.status_code == 200, path
        payload = response.json()
        item = payload[0] if isinstance(payload, list) else payload["items"][0] if "items" in payload else payload
        assert item["score_explanation"]["status"] == "UNAVAILABLE", path
        assert item["discount_percent"] is None, path
        assert item["price_per_person_pln"] == str(deal.price_per_person_pln), path


@pytest.mark.parametrize("price,expected", [("200", "50.00"), ("400", "0"), ("600", "0")])
def test_compatibility_discount_comes_from_validated_comparison(api_client, isolated_db, price, expected):
    deal = scored_deal(isolated_db, price=price)
    deal.discount_percent = Decimal(99)  # A stale denormalized field is not evidence.
    isolated_db.commit()
    result = api_client.get(f"/api/v1/deals/{deal.slug}").json()
    assert result["score_explanation"]["status"] == "CURRENT"
    assert Decimal(result["discount_percent"]) == Decimal(expected)
    assert isolated_db.get(type(deal), deal.id).discount_percent == 99  # Read-only serialization.


@pytest.mark.parametrize("baseline,count", [(None, 0), (Decimal(400), 4), (Decimal(400), 5)])
def test_valid_sparse_and_current_snapshots_keep_the_existing_threshold(api_client, isolated_db, baseline, count):
    deal = scored_deal(isolated_db, baseline=baseline, count=count)
    result = api_client.get(f"/api/v1/deals/{deal.slug}").json()
    assert result["score_explanation"]["status"] == ("CURRENT" if count == 5 else "PROVISIONAL")
    assert (result["discount_percent"] is not None) == (count == 5)


@pytest.mark.parametrize("case", REFERENCE, ids=lambda case: case["name"])
def test_api_matches_reference_used_by_price_assessment(api_client, isolated_db, case):
    deal = scored_deal(isolated_db, price=case["price"], count=case["count"],
                       baseline=Decimal(case["median"]) if case["median"] else None)
    payload = api_client.get(f"/api/v1/deals/{deal.slug}").json()
    assert payload["deal_score"] == case["score"]
    comparison = payload["score_explanation"]
    assert comparison["status"] == case["status"]
    assert comparison["sample_count"] == case["count"]
    assert comparison["current_price_pln"] == payload["flight_price_pln"] == payload["price_per_person_pln"] == case["price"]
    assert comparison["median_price_pln"] == case["median"]
    assert comparison["price_difference_percent"] == case["difference"]
