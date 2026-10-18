import asyncio
from dataclasses import replace

import httpx
import pytest
from app.models.data_provider import DataProvider
from app.models.location import Destination, DestinationAlias
from app.services.currency import PlnOnlyConverter
from app.services.destination_discovery import discover_destinations
from app.services.destinations import PROVIDER
from app.services.ingestion import ingest_offers, resolve_destination
from sqlalchemy import select
from tests.test_lifecycle import NOW, setup


def reference_transport(*, status=200, city_code="REK", city_name="Reykjavik", duplicate=False):
    city = {"code": city_code, "name": city_name, "country_code": "IS", "time_zone": "Atlantic/Reykjavik"}
    data = {
        "cities": [city, city] if duplicate else [city],
        "airports": [{"code": "KEF", "city_code": city_code, "country_code": "IS", "iata_type": "airport"}],
        "countries": [{"code": "IS", "name": "Iceland"}],
    }
    def handle(request):
        assert "x-access-token" not in request.headers
        return httpx.Response(status, json=data[request.url.path.split("/")[-1].split(".")[0]])
    return httpx.MockTransport(handle)


def discover(db, offers, **kwargs):
    return asyncio.run(discover_destinations(db, offers, transport=reference_transport(**kwargs)))


def test_discovers_and_ingests_in_same_run_then_no_network(isolated_db):
    db = isolated_db
    raw = replace(setup(db), destination="REK", payload={"destination_airport": "KEF"})
    db.add(DataProvider(code=PROVIDER, name="Provider"))
    db.commit()
    result = discover(db, [raw])
    assert (result.destinations_added, result.aliases_added, result.unresolved_offers) == (1, 2, 0)
    city = db.scalar(select(Destination).where(Destination.slug == "reykjavik"))
    assert city.timezone == "Atlantic/Reykjavik"
    assert resolve_destination(db, PROVIDER, replace(raw, destination="KEF", payload={})) == (city.id, False)
    ingestion = ingest_offers(db, provider_code=PROVIDER, offers=[raw], converter=PlnOnlyConverter(), now=NOW)
    assert ingestion.saved_offers == 1
    def unexpected(request):
        pytest.fail("Known routes must not fetch reference data")
    again = asyncio.run(discover_destinations(db, [raw], transport=httpx.MockTransport(unexpected)))
    assert again.status == "not_needed"
    assert again.destinations_added == 0


@pytest.mark.parametrize("status", [429, 500])
def test_reference_outage_preserves_known_routes_and_retries(isolated_db, status):
    db = isolated_db
    known = setup(db)
    raw = replace(known, destination="REK", payload={})
    failed = discover(db, [known, raw], status=status)
    assert failed.status == "reference_unavailable"
    assert failed.unresolved_offers == 1
    assert resolve_destination(db, PROVIDER, known)[0] is not None
    assert discover(db, [raw]).destinations_added == 1


def test_disabled_destination_is_not_reenabled(isolated_db):
    db = isolated_db
    raw = replace(setup(db), destination="REK", payload={})
    db.add(Destination(slug="reykjavik", city="Custom", country="Iceland", country_code="IS", iata_code="REK", is_active=False))
    db.commit()
    result = discover(db, [raw])
    assert result.destinations_added == 0 and result.unresolved_offers == 1
    city = db.scalar(select(Destination).where(Destination.slug == "reykjavik"))
    assert not city.is_active and city.city == "Custom"


def test_conflicting_airport_and_city_never_guessed(isolated_db):
    raw = replace(setup(isolated_db), destination="REK", payload={"destination_airport": "BCN"})
    result = discover(isolated_db, [raw])
    assert result.destinations_added == 0 and result.conflicts == 1


def test_duplicate_reference_codes_are_rejected(isolated_db):
    raw = replace(setup(isolated_db), destination="REK", payload={})
    result = discover(isolated_db, [raw], duplicate=True)
    assert result.destinations_added == 0 and result.unresolved_offers == 1


def test_unreviewed_city_uses_stable_unique_slug_and_rolls_back(isolated_db):
    db = isolated_db
    raw = replace(setup(db), destination="XYZ", payload={})
    # sqlite legacy mode does not begin a transaction for SELECT/SAVEPOINT.
    db.connection().exec_driver_sql("BEGIN")
    discover(db, [raw], city_code="XYZ", city_name="New City")
    city = db.scalar(select(Destination).where(Destination.slug == "new-city-is-xyz"))
    assert city and city.country_code == "IS"
    db.rollback()
    assert db.scalar(select(Destination).where(Destination.slug == "new-city-is-xyz")) is None


def test_existing_manual_alias_and_name_are_preserved(isolated_db):
    db = isolated_db
    raw = replace(setup(db), destination="KEF", payload={})
    city = Destination(slug="custom-reykjavik", city="Custom", country="Iceland", country_code="IS", iata_code="REK")
    db.add(city)
    db.commit()
    result = discover(db, [raw])
    assert result.destinations_added == 0 and result.aliases_added == 2
    assert resolve_destination(db, PROVIDER, raw) == (city.id, False)
    assert city.city == "Custom" and city.slug == "custom-reykjavik"
    assert db.scalar(select(DestinationAlias).where(DestinationAlias.code == "KEF")).destination_id == city.id


def test_pipeline_persists_discovery_and_offer_together(monkeypatch):
    from types import SimpleNamespace

    from app.jobs import pipeline
    from app.models.job import JobRun
    from app.models.offer import TravelOffer
    from app.providers.travelpayouts import TravelpayoutsDataProvider
    from app.services.jobs import run_tracked_pipeline
    from tests.test_jobs import make_session_factory

    factory = make_session_factory()
    with factory() as db:
        setup(db)
        db.add(DataProvider(code=PROVIDER, name="Provider"))
        db.commit()
    reference = reference_transport()
    def handle(request):
        if request.url.path.startswith("/data/en/"):
            return reference.handle_request(request)
        return httpx.Response(200, json={"success": True, "data": [{
            "origin": "WRO", "destination": "REK", "destination_airport": "KEF",
            "price": 200, "departure_at": "2030-10-01", "return_at": "2030-10-04",
        }]})
    provider = TravelpayoutsDataProvider(token="fixture", transport=httpx.MockTransport(handle))
    monkeypatch.setattr(pipeline, "TravelpayoutsDataProvider", lambda: provider)
    monkeypatch.setattr(pipeline, "SessionLocal", factory)
    monkeypatch.setattr(pipeline, "get_settings", lambda: SimpleNamespace(ingestion_origins="WRO"))
    result = asyncio.run(run_tracked_pipeline(pipeline.run_travelpayouts_pipeline, factory))
    assert result.ingestion.saved_offers == 1
    assert result.destination_discovery.destinations_added == 1
    with factory() as db:
        assert db.scalar(select(TravelOffer)) is not None
        assert db.scalar(select(JobRun)).result_json["destination_discovery"]["unresolved_offers"] == 0
