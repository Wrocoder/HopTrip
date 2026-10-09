import pytest
from app.models.location import Airport
from helpers import catalog_fixture


@pytest.mark.parametrize("origin", ["WRO", "wro", "Wrocław", "Wroclaw", "  WROCŁAW  ", "Wrocław — WRO"])
def test_city_and_iata_find_same_deal_at_budget_boundary(api_client, isolated_db, origin):
    catalog_fixture(isolated_db, price="200.00")
    response = api_client.get("/api/v1/deals", params={"origin": origin, "budget": "200"})
    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == ["fixture-deal"]
    cheaper = api_client.get("/api/v1/deals", params={"origin": origin, "budget": "199.99"})
    assert cheaper.status_code == 200
    assert cheaper.json() == []


@pytest.mark.parametrize("origin", ["Missing city", "ZZZ", "  ", "Wr"])
def test_unknown_origin_is_not_an_empty_search(api_client, isolated_db, origin):
    catalog_fixture(isolated_db)
    response = api_client.get("/api/v1/deals", params={"origin": origin})
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "UNKNOWN_ORIGIN"


def test_ambiguous_city_requires_specific_airport(api_client, isolated_db):
    isolated_db.add_all([
        Airport(iata_code="WAW", name="Chopin", city="Warsaw", country_code="PL"),
        Airport(iata_code="WMI", name="Modlin", city="Nowy Dwór Mazowiecki", country_code="PL"),
    ])
    isolated_db.commit()
    for city in ["Warszawa", "warsaw"]:
        response = api_client.get("/api/v1/deals", params={"origin": city})
        assert response.status_code == 422
        assert response.json()["detail"]["code"] == "AMBIGUOUS_ORIGIN"
    for code in ["WAW", "WMI"]:
        assert api_client.get("/api/v1/deals", params={"origin": code}).status_code == 200


def test_inactive_airport_is_not_resolved_and_aliases_are_public(api_client, isolated_db):
    catalog_fixture(isolated_db)
    isolated_db.add(Airport(
        iata_code="LCJ", name="Łódź Airport", city="Łódź", country_code="PL", is_active=False,
    ))
    isolated_db.commit()
    for value in ["LCJ", "Lodz"]:
        response = api_client.get("/api/v1/deals", params={"origin": value})
        assert response.status_code == 404
    airports = api_client.get("/api/v1/airports").json()
    assert len(airports) == 1
    assert "Wrocław" in airports[0]["aliases"]
    assert api_client.get("/api/v1/deals").status_code == 200
