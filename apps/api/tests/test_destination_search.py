import pytest
from app.models.location import Destination, DestinationAlias
from helpers import catalog_fixture


@pytest.mark.parametrize("value", ["milan", "Milan", " MILAN ", "Mediolan", " mediolan ", "MIL", "MXP", "bgy"])
def test_destination_aliases_keep_all_filters(api_client, isolated_db, value):
    deal, _ = catalog_fixture(isolated_db, price="200.00")
    city = isolated_db.get(Destination, deal.destination_id)
    city.slug, city.city, city.country_code, city.iata_code = "milan", "Milan", "IT", "MIL"
    isolated_db.commit()
    params = {"destination": value, "origin": "WRO", "budget": "200", "duration_min": 3,
              "duration_max": 3, "departure_from": deal.trip_start.isoformat(),
              "departure_to": deal.trip_start.isoformat(), "limit": 1}
    response = api_client.get("/api/v1/deals", params=params)
    assert response.status_code == 200
    assert [d["slug"] for d in response.json()] == [deal.slug]
    for change in [{"budget": "199.99"}, {"offset": 1}, {"duration_min": 4, "duration_max": 5}]:
        assert api_client.get("/api/v1/deals", params={**params, **change}).json() == []


@pytest.mark.parametrize("value", ["", "   "])
def test_blank_destination_is_any(api_client, isolated_db, value):
    catalog_fixture(isolated_db)
    assert len(api_client.get("/api/v1/deals", params={"destination": value}).json()) == 1


@pytest.mark.parametrize("value", ["unknown-city", "Mila", "ZZZ"])
def test_unknown_or_partial_destination_is_not_guessed(api_client, isolated_db, value):
    catalog_fixture(isolated_db)
    response = api_client.get("/api/v1/deals", params={"destination": value})
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "UNKNOWN_DESTINATION"


def test_ambiguous_codes_and_names_require_explicit_slug(api_client, isolated_db):
    cities = [Destination(slug=slug, city="Shared City", country="Test", country_code="XX")
              for slug in ("first", "second")]
    isolated_db.add_all(cities)
    isolated_db.flush()
    isolated_db.add_all([DestinationAlias(destination_id=city.id, provider_code=str(index),
                                         code="ABC", kind="AIRPORT")
                         for index, city in enumerate(cities)])
    isolated_db.commit()
    for value in ["ABC", "shared   city"]:
        response = api_client.get("/api/v1/deals", params={"destination": value})
        assert response.status_code == 422
        assert response.json()["detail"]["code"] == "AMBIGUOUS_DESTINATION"
    assert api_client.get("/api/v1/deals?destination=first").status_code == 200
    cities[1].is_active = False
    isolated_db.commit()
    assert api_client.get("/api/v1/deals?destination=ABC").status_code == 200
    assert api_client.get("/api/v1/deals?destination=second").status_code == 404


def test_public_vocabulary_exposes_polish_label_and_codes_without_renaming(api_client, isolated_db):
    isolated_db.add(Destination(slug="milan", city="Milan", country="Italy", country_code="IT"))
    isolated_db.commit()
    city = api_client.get("/api/v1/destinations").json()[0]
    assert city["slug"] == "milan" and city["city"] == "Milan"
    assert city["display_name"] == "Mediolan"
    assert {"Milan", "Mediolan"} <= set(city["aliases"])
    assert {"MIL", "MXP", "BGY"} <= set(city["iata_codes"])
