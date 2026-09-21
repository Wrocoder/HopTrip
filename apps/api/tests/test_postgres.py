"""Only runs on explicit hoptrip_test database. Each test uses its own disposable schema."""

import asyncio
import multiprocessing
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

import pytest
from app.db.base import Base
from app.jobs.pipeline import PipelineResult
from app.models.data_provider import DataProvider
from app.models.job import JobRun
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation, TravelOffer
from app.models.statistics import RouteStatistics
from app.providers.base import ProviderTransientError, RawTravelOffer
from app.services.currency import PlnOnlyConverter
from app.services.ingestion import IngestionResult, ingest_offers
from app.services.jobs import pipeline_lock, run_tracked_pipeline
from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

pytestmark = pytest.mark.postgres


@pytest.fixture
def pg_factory():
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set TEST_DATABASE_URL for isolated PostgreSQL")
    assert make_url(url).database == "hoptrip_test", "Refuse any non-test database"
    engine = create_engine(url)
    schema = "test_" + uuid4().hex
    with engine.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    isolated = create_engine(url, connect_args={"options": f"-csearch_path={schema}"})
    Base.metadata.create_all(isolated)
    factory = sessionmaker(isolated, autoflush=False)
    with factory() as db:
        db.add_all(
            [
                DataProvider(code="test", name="Test"),
                Airport(iata_code="WRO", name="WRO", city="Wroclaw", country_code="PL"),
                Destination(
                    iata_code="BCN",
                    city="Barcelona",
                    country="Spain",
                    country_code="ES",
                    slug="barcelona",
                ),
            ]
        )
        db.commit()
    yield factory, url
    isolated.dispose()
    # This schema was generated above in the explicitly checked disposable database.
    with engine.begin() as connection:
        connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
    engine.dispose()


def test_migration_head():
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set TEST_DATABASE_URL")
    assert make_url(url).database == "hoptrip_test"
    with create_engine(url).connect() as db:
        assert (
            db.scalar(text("SELECT version_num FROM alembic_version"))
            == "0013_integrity_and_affiliates"
        )


def test_concurrent_ingestion_and_null_duration_uniqueness(pg_factory):
    factory, _ = pg_factory
    now = datetime.now(UTC)
    raw = RawTravelOffer(
        "same",
        "WRO",
        "BCN",
        now + timedelta(days=30),
        None,
        Decimal("200"),
        "PLN",
        None,
        "test",
        {},
    )

    def writer(index):
        with factory() as db:
            return ingest_offers(
                db,
                provider_code="test",
                offers=[raw],
                converter=PlnOnlyConverter(),
                now=now + timedelta(seconds=index),
            )

    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(writer, [0, 1]))
    with factory() as db:
        assert len(db.scalars(select(TravelOffer)).all()) == 1
        assert len(db.scalars(select(PriceObservation)).all()) == 1
        offer = db.scalar(select(TravelOffer))
        observation = db.scalar(select(PriceObservation))
        assert offer.last_verified_at == observation.observed_at
        values = dict(
            data_provider_id=1,
            origin_airport_id=1,
            destination_id=1,
            product_type="FLIGHT",
            departure_month="2030-10",
            trip_duration_days=None,
            sample_count=1,
            min_price_pln=200,
            p25_price_pln=200,
            median_price_pln=200,
            p75_price_pln=200,
            max_price_pln=200,
            confidence=0,
        )
        db.add(RouteStatistics(**values))
        db.commit()
        with pytest.raises(IntegrityError):
            with db.begin_nested():
                db.add(RouteStatistics(**values))
                db.flush()


def _lock_probe(url, queue):
    engine = create_engine(url)
    with pipeline_lock(sessionmaker(engine)) as acquired:
        queue.put(acquired)
    engine.dispose()


def test_lock_across_processes_and_release(pg_factory):
    factory, url = pg_factory
    context = multiprocessing.get_context("spawn")
    with pipeline_lock(factory) as acquired:
        assert acquired
        queue = context.Queue()
        process = context.Process(target=_lock_probe, args=(url, queue))
        process.start()
        assert queue.get(timeout=20) is False
        process.join(20)
        assert process.exitcode == 0
    with pipeline_lock(factory) as acquired:
        assert acquired


def test_logical_retry_and_interrupted_recovery(pg_factory):
    factory, _ = pg_factory
    with factory() as db:
        db.add(
            JobRun(
                job_type="TRAVELPAYOUTS_PIPELINE", status="RUNNING", run_id=str(uuid4()), attempt=1
            )
        )
        db.commit()
    calls = 0

    async def pipeline():
        nonlocal calls
        calls += 1
        if calls == 1:
            raise ProviderTransientError("temporary")
        return PipelineResult(IngestionResult(), 0, 0)

    asyncio.run(run_tracked_pipeline(pipeline, factory, max_attempts=2))
    with factory() as db:
        rows = db.scalars(select(JobRun).order_by(JobRun.id)).all()
        assert [r.status for r in rows] == ["INTERRUPTED", "FAILED", "SUCCEEDED"]
        assert rows[1].run_id == rows[2].run_id
        assert rows[1].next_retry_at is not None


def test_legacy_duplicate_migration_fails_without_removing_history():
    import subprocess
    import sys
    from pathlib import Path

    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set TEST_DATABASE_URL")
    assert make_url(url).database == "hoptrip_test"
    schema = "test_legacy_" + uuid4().hex
    engine = create_engine(url)
    with engine.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    test_url = make_url(url).update_query_dict({"options": f"-csearch_path={schema}"})
    env = {**os.environ, "DATABASE_URL": test_url.render_as_string(hide_password=False)}
    scoped = create_engine(test_url)
    try:
        command = [sys.executable, "-m", "alembic", "upgrade"]
        first = subprocess.run(
            command + ["0012_provider_capabilities"],
            cwd=Path(__file__).parents[1],
            env=env,
            capture_output=True,
            text=True,
        )
        assert first.returncode == 0, first.stderr
        with scoped.begin() as db:
            provider_id = db.scalar(text("SELECT id FROM data_providers LIMIT 1"))
            for _ in range(2):
                db.execute(
                    text(
                        "INSERT INTO travel_offers (data_provider_id,external_id,product_type,depart_at,original_price,original_currency,source) VALUES (:provider,'legacy-duplicate','FLIGHT',now()+interval '30 days',200,'PLN','fixture')"
                    ),
                    {"provider": provider_id},
                )
        failed = subprocess.run(
            command + ["head"],
            cwd=Path(__file__).parents[1],
            env=env,
            capture_output=True,
            text=True,
        )
        assert failed.returncode != 0
        with scoped.connect() as db:
            assert db.scalar(text("SELECT count(*) FROM travel_offers")) == 2
            assert (
                db.scalar(text("SELECT version_num FROM alembic_version"))
                == "0012_provider_capabilities"
            )
    finally:
        scoped.dispose()
        with engine.begin() as db:
            db.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        engine.dispose()
