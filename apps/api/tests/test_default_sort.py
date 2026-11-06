"""Default ordering must not depend on historical coverage or a corrupt score."""
from decimal import Decimal

import pytest
from app.models.deal import Deal
from helpers import catalog_fixture


@pytest.mark.parametrize("path", ["/api/v1/deals", "/api/v1/departures/WRO/deals", "/api/v1/destinations/barcelona/deals"])
def test_default_is_price_and_explicit_score_remains_compatible(api_client, isolated_db, path):
    first, _ = catalog_fixture(isolated_db, price="200")
    other = Deal(**{column.name: getattr(first, column.name) for column in Deal.__table__.columns
                    if column.name not in {"id", "slug"}})
    other.slug = "expensive-with-high-score"
    other.price_per_person_pln = other.flight_price_pln = Decimal(600)
    other.deal_score = 99
    isolated_db.add(other)
    isolated_db.commit()
    result = api_client.get(path).json()
    assert [d["id"] for d in result] == [first.id, other.id]
    assert api_client.get(path, params={"sort": "price"}).json() == result
    assert [d["id"] for d in api_client.get(path, params={"sort": "score"}).json()] == [other.id, first.id]
    assert api_client.get(path, params={"sort": "invalid"}).status_code == 422
    if path == "/api/v1/deals":
        pages = [api_client.get(path, params={"include_total": "true", "limit": 1, "offset": n}).json() for n in [0, 1]]
        assert [p["total"] for p in pages] == [2, 2]
        assert [p["items"][0] for p in pages] == result
