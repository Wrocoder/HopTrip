from datetime import timedelta
from decimal import Decimal

import pytest
from app.models.deal import Deal
from helpers import catalog_fixture


@pytest.mark.parametrize("sort", ["score", "price", "departure"])
def test_order_and_count_cover_full_filtered_set(api_client, isolated_db, sort):
    first, _ = catalog_fixture(isolated_db, price="250")
    for index in range(1, 19):
        isolated_db.add(Deal(
            slug=f"sorted-{index}", origin_airport_id=first.origin_airport_id,
            destination_id=first.destination_id,
            trip_start=first.trip_start + timedelta(days=index % 3),
            trip_end=first.trip_end + timedelta(days=index % 3),
            depart_at=first.depart_at + timedelta(days=index % 3),
            nights=3, travelers=1, price_per_person_pln=Decimal(200 + index % 4),
            flight_price_pln=200, total_estimated_pln=200,
            deal_score=70 + index % 2, confidence=0,
            last_verified_at=first.last_verified_at, expires_at=first.expires_at,
            is_visible=index != 18,
        ))
    isolated_db.commit()
    params = dict(origin="WRO", destination="BCN", budget=220, duration_min=3,
                  duration_max=3, sort=sort, include_total="true", limit=5)
    pages = [api_client.get("/api/v1/deals", params={**params, "offset":i}).json()
             for i in [0, 5, 10, 15]]
    assert [page["total"] for page in pages] == [17] * 4
    items = [item for page in pages for item in page["items"]]
    assert len({item["id"] for item in items}) == 17
    keys = {
        "score": lambda d: (-d["deal_score"], d["trip_start"], d["id"]),
        "price": lambda d: (Decimal(d["price_per_person_pln"]), d["trip_start"], d["id"]),
        "departure": lambda d: (d["trip_start"], Decimal(d["price_per_person_pln"]), d["id"]),
    }
    assert items == sorted(items, key=keys[sort])
    assert api_client.get("/api/v1/deals", params=params).json() == pages[0]
    past = api_client.get("/api/v1/deals", params={**params, "offset":100}).json()
    assert past["total"] == 17 and past["items"] == []
    empty = api_client.get("/api/v1/deals", params={**params, "budget":0}).json()
    assert empty["total"] == 0 and empty["items"] == []
    legacy = api_client.get("/api/v1/deals", params={**params, "include_total":"false"}).json()
    assert legacy == pages[0]["items"]
    assert api_client.get("/api/v1/deals?sort=unknown&include_total=true").status_code == 422


def test_total_includes_weekend_and_freshness_rules(api_client, isolated_db):
    deal, _ = catalog_fixture(isolated_db)
    assert api_client.get("/api/v1/deals?include_total=true").json()["total"] == 1
    assert api_client.get("/api/v1/deals?include_total=true&weekend=true").json()["total"] == 0
    deal.expires_at = deal.last_verified_at - timedelta(days=1)
    isolated_db.commit()
    assert api_client.get("/api/v1/deals?include_total=true").json()["total"] == 0
