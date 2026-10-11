from datetime import UTC, date, datetime, time, timedelta

import pytest
from app.models.data_provider import DataProvider
from app.models.offer import TravelOffer
from helpers import catalog_fixture


@pytest.mark.parametrize("start,end,has_return,expected", [
    ("2030-05-03", "2030-05-05", True, True),
    ("2030-05-04", "2030-05-05", True, True),
    ("2030-05-02", "2030-05-05", True, False),
    ("2030-05-03", "2030-05-06", True, False),
    ("2030-05-03", "2030-05-12", True, False),
    ("2030-05-03", "2030-04-28", True, False),
    ("2030-05-03", "2030-05-05", False, False),
    ("2030-03-29", "2030-03-31", True, True),  # Warsaw DST starts
    ("2030-10-25", "2030-10-27", True, True),  # Warsaw DST ends
])
def test_weekend_requires_same_sunday_and_return_flight(
    api_client, isolated_db, start, end, has_return, expected
):
    deal, component = catalog_fixture(isolated_db, price="300.00")
    deal.trip_start, deal.trip_end = date.fromisoformat(start), date.fromisoformat(end)
    deal.depart_at = datetime.combine(deal.trip_start, time(12), UTC)
    # The dates must win over an inconsistent cached night count.
    deal.nights = 2
    provider = DataProvider(code="weekend-test", name="Local fixture")
    isolated_db.add(provider)
    isolated_db.flush()
    offer = TravelOffer(
        data_provider_id=provider.id, external_id="fixture", source="fixture",
        depart_at=deal.depart_at,
        return_at=datetime.combine(deal.trip_end, time(12), UTC) if has_return else None,
        original_price=300, original_currency="PLN",
    )
    isolated_db.add(offer)
    isolated_db.flush()
    component.travel_offer_id = offer.id
    isolated_db.commit()
    params = {"weekend": "true", "origin": "WRO", "destination": "barcelona",
              "budget": "300", "duration_min": 2, "duration_max": 3,
              "departure_from": start, "departure_to": start, "limit": 1}
    response = api_client.get("/api/v1/deals", params=params)
    assert response.status_code == 200
    assert [d["slug"] for d in response.json()] == ([deal.slug] if expected else [])
    if expected:
        assert response.json()[0]["trip_type"] == "ROUND_TRIP"
        for change in [{"budget": "299.99"}, {"offset": 1}, {"duration_min": 3},
                       {"departure_to": (deal.trip_start - timedelta(days=1)).isoformat(),
                        "departure_from": "2030-01-01"}]:
            filtered = api_client.get("/api/v1/deals", params={**params, **change})
            assert filtered.status_code == 200
            assert filtered.json() == []
    assert len(api_client.get("/api/v1/deals?weekend=false").json()) == 1


@pytest.mark.parametrize("params", [
    {"departure_from": "2030-02-30"}, {"departure_to": "not-a-date"},
    {"departure_from": "2030-05-05", "departure_to": "2030-05-03"},
    {"duration_min": 3, "duration_max": 2}, {"duration_min": -1},
    {"duration_max": "2.5"}, {"weekend": "unknown"},
])
def test_invalid_trip_filters_return_422(api_client, params):
    assert api_client.get("/api/v1/deals", params=params).status_code == 422
