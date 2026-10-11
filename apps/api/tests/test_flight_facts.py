from datetime import UTC, datetime

import pytest
from app.models.data_provider import DataProvider
from app.models.offer import TravelOffer
from app.services.catalog import serialize_deal
from app.services.flight_facts import flight_facts
from helpers import catalog_fixture


def offer(**changes):
    return TravelOffer(
        source=changes.pop("source", "travelpayouts_data"),
        product_type="FLIGHT",
        departure_precision=changes.pop("departure_precision", "TIME"),
        depart_at=datetime(2030, 3, 30, 22, tzinfo=UTC),
        return_at=changes.pop("return_at", datetime(2030, 3, 31, 10, tzinfo=UTC)),
        raw_payload=changes,
    )


def test_offset_and_dst_interval_uses_elapsed_time_and_independent_legs():
    facts = flight_facts(offer(
        origin_airport="WRO", destination="MIL", destination_airport="BGY", airline="FR",
        departure_at="2030-03-30T23:00:00+01:00", duration_to=120,
        transfers=0, return_transfers=1,
    ))
    assert facts.destination_code == "MIL"
    assert facts.destination_airport == "BGY"
    assert facts.outbound_arrival == datetime(2030, 3, 31, tzinfo=UTC)
    assert facts.outbound_stops == 0 and facts.return_stops == 1
    timed = offer()
    timed.raw_payload = {
        "departure_at": "2030-03-30T23:00:00+01:00", "duration_to": 120,
        "return_at": "2030-03-31T12:00:00+02:00", "duration_back": 90,
    }
    facts = flight_facts(timed)
    assert facts.destination_interval_minutes == 600
    assert facts.return_arrival == datetime(2030, 3, 31, 11, 30, tzinfo=UTC)


@pytest.mark.parametrize("bad", [None, True, -1, 1.5, "0", {}, 999999])
def test_invalid_counts_are_unknown(bad):
    facts = flight_facts(offer(transfers=bad, return_transfers=bad, duration_to=bad))
    assert facts.outbound_stops is None and facts.return_stops is None
    assert facts.outbound_arrival is None


@pytest.mark.parametrize("stamp", ["2030-03-30", "2030-03-30T10:00:00", "invalid"])
def test_date_only_naive_and_invalid_times_are_not_schedule(stamp):
    facts = flight_facts(offer(departure_at=stamp, duration_to=90))
    assert facts.outbound_departure is None
    assert facts.outbound_arrival is None
    assert facts.destination_interval_minutes is None


def test_untrusted_source_date_precision_missing_airport_and_one_way():
    assert flight_facts(offer(source="fixture", airline="FR")).airline_code is None
    facts = flight_facts(offer(
        departure_precision="DATE", departure_at="2030-03-30T00:00:00Z",
        destination="MIL", airline="<script>", return_at=None, return_transfers=0,
    ))
    assert facts.outbound_departure is None
    assert facts.destination_code == "MIL" and facts.destination_airport is None
    assert facts.airline_code is None and facts.return_stops is None
    assert facts.return_departure is None


def test_impossible_interval_is_not_published():
    timed = offer()
    timed.raw_payload = {
        "departure_at": "2030-03-30T23:00:00Z", "duration_to": 120,
        "return_at": "2030-03-30T23:30:00Z",
    }
    assert flight_facts(timed).destination_interval_minutes is None


def test_public_contract_and_non_flight_component(api_client, isolated_db):
    deal, component = catalog_fixture(isolated_db)
    provider = DataProvider(code="facts-test", name="Local fixture")
    isolated_db.add(provider)
    isolated_db.flush()
    flight = offer(destination="MIL", destination_airport="BGY", airline="FR", transfers=0)
    flight.data_provider_id = provider.id
    flight.external_id = "facts"
    flight.original_price = 200
    flight.original_currency = "PLN"
    flight.raw_payload["secret"] = "never-public"
    isolated_db.add(flight)
    isolated_db.flush()
    component.travel_offer_id = flight.id
    isolated_db.commit()
    response = api_client.get("/api/v1/deals/" + deal.slug)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_type"] == "ROUND_TRIP"
    assert body["flight_facts"]["origin_airport"] == "WRO"
    assert body["flight_facts"]["destination_airport"] == "BGY"
    assert body["flight_facts"]["airline_code"] == "FR"
    assert "secret" not in response.text
    component.component_type = "HOTEL"
    isolated_db.commit()
    result = serialize_deal(isolated_db, deal)
    assert result.trip_type == "ONE_WAY"
    assert result.flight_facts.airline_code is None
