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


def test_personal_telegram_concurrent_updates_have_one_subscription_and_reply(pg_factory):
    from threading import Barrier

    from app.models.telegram import TelegramDelivery, TelegramSubscription
    from app.services.telegram_subscriptions import receive_update
    from test_alert_digests import NOW, offer
    from test_telegram import config, update

    factory, _ = pg_factory
    with factory() as db:
        offer(db)
    barrier = Barrier(2)

    def run():
        with factory() as db:
            barrier.wait(timeout=10)
            receive_update(db, config(), update(text='/subscribe origin=WRO budget=250'), NOW)

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run) for _ in range(2)]
        for future in futures:
            future.result(timeout=20)
    with factory() as db:
        assert len(list(db.scalars(select(TelegramSubscription)))) == 1
        assert len(list(db.scalars(select(TelegramDelivery)))) == 1


def test_personal_telegram_concurrent_workers_have_one_submission(pg_factory):
    from threading import Barrier

    from app.models.telegram import TelegramDelivery
    from app.services.telegram_delivery import deliver_once
    from test_alert_digests import NOW
    from test_telegram import Sender, active, config

    factory, _ = pg_factory
    with factory() as db:
        active(db)
    sender, barrier = Sender(), Barrier(2)

    def run():
        with factory() as db:
            barrier.wait(timeout=10)
            return deliver_once(db, config(), sender, NOW)

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run) for _ in range(2)]
        results = [future.result(timeout=20) for future in futures]
    assert sum(result['sent'] for result in results) == 1
    assert len(sender.messages) == 1
    with factory() as db:
        assert len(list(db.scalars(select(TelegramDelivery)))) == 1


def test_personal_telegram_accepts_fresh_reset_identifier_after_inactivity(pg_factory):
    from app.services.telegram_subscriptions import receive_update
    from test_alert_digests import NOW
    from test_telegram import active, config, update

    factory, _ = pg_factory
    with factory() as db:
        sub = active(db)
        later = NOW + timedelta(days=8)
        receive_update(db, config(), update(1, '/stop', now=later), later)
        assert sub.status == 'STOPPED'
        receive_update(db, config(), update(0, '/confirm', now=later), later)
        assert sub.status == 'STOPPED'


def test_concurrent_digest_workers_send_one_message(pg_factory, monkeypatch):
    from threading import Barrier

    from app.models.alert import AlertDelivery
    from app.services import alert_digests
    from test_alert_digests import NOW, offer, settings, subscription

    factory, _ = pg_factory
    with factory() as db:
        subscription(db)
        offer(db)
    messages = []
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: messages.append(args))
    barrier = Barrier(2)

    def run():
        with factory() as db:
            barrier.wait(timeout=10)
            return alert_digests.deliver_digests(db, settings(), NOW)

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run) for _ in range(2)]
        results = [future.result(timeout=20) for future in futures]
    assert sum(result['sent'] for result in results) == 1
    assert len(messages) == 1
    with factory() as db:
        assert len(list(db.scalars(select(AlertDelivery)))) == 1


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
            == "0021_telegram_alerts"
        )


def test_observation_deadline_survives_concurrent_quote_reappearance(pg_factory):
    from dataclasses import replace
    from threading import Barrier

    from app.services.time import utc

    factory, _ = pg_factory
    now = datetime.now(UTC)
    deadline = now + timedelta(hours=1)
    raw = RawTravelOffer("expiry-race", "WRO", "BCN", now + timedelta(days=60), None,
                         Decimal(209), "PLN", deadline, "test", {})
    with factory() as db:
        ingest_offers(db, provider_code="test", offers=[raw], converter=PlnOnlyConverter(), now=now)
        ingest_offers(db, provider_code="test", offers=[replace(raw, price=Decimal(220), expires_at=None)],
                      converter=PlnOnlyConverter(), now=now + timedelta(minutes=30))
    barrier = Barrier(2)

    def repeat(expiry):
        with factory() as db:
            barrier.wait(timeout=10)
            return ingest_offers(db, provider_code="test", offers=[replace(raw, expires_at=expiry)],
                                 converter=PlnOnlyConverter(), now=now + timedelta(hours=2),
                                 price_snapshot=True)

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(repeat, expiry) for expiry in (None, now + timedelta(days=5))]
        for future in futures:
            future.result(timeout=30)
    with factory() as db:
        assert utc(db.scalar(select(TravelOffer)).expires_at) == deadline
        history = list(db.scalars(select(PriceObservation).order_by(PriceObservation.observed_at)))
        assert len(history) == 2 and utc(history[0].expires_at) == deadline


def test_observation_expiry_migration_preserves_populated_history(pg_factory):
    import importlib.util
    from pathlib import Path

    from alembic.migration import MigrationContext
    from alembic.operations import Operations
    from sqlalchemy import inspect

    factory, _ = pg_factory
    with factory() as db:
        provider = db.scalar(select(DataProvider))
        db.add(PriceObservation(data_provider_id=provider.id, product_type="FLIGHT",
            departure_date=datetime.now(UTC).date(), observed_price_pln=123,
            original_price=123, original_currency="PLN", source="migration-fixture"))
        db.commit()
    path = Path(__file__).resolve().parents[1] / "alembic/versions/0019_observation_expiry.py"
    spec = importlib.util.spec_from_file_location("observation_expiry_migration", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    engine = factory.kw["bind"]
    with engine.begin() as connection:
        # Only this fixture's generated schema in hoptrip_test is affected.
        connection.execute(text("ALTER TABLE price_observations DROP COLUMN expires_at"))
        with Operations.context(MigrationContext.configure(connection)):
            module.upgrade()
            row = connection.execute(text(
                "SELECT original_price, source, expires_at FROM price_observations"
            )).one()
            assert row.original_price == Decimal(123)
            assert row.source == "migration-fixture" and row.expires_at is None
            assert next(c for c in inspect(connection).get_columns("price_observations")
                        if c["name"] == "expires_at")["nullable"]
            module.downgrade()
            assert connection.scalar(text("SELECT count(*) FROM price_observations")) == 1
            module.upgrade()
            assert connection.scalar(text("SELECT count(*) FROM price_observations")) == 1


def test_statistics_version_migration_does_not_certify_legacy_cache(pg_factory):
    import importlib.util
    from pathlib import Path

    from alembic.migration import MigrationContext
    from alembic.operations import Operations

    factory, _ = pg_factory
    with factory() as db:
        db.add(RouteStatistics(data_provider_id=1, origin_airport_id=1, destination_id=1,
            product_type="FLIGHT", departure_month="2030-10", trip_duration_days=None,
            sample_count=30, min_price_pln=123, p25_price_pln=123, median_price_pln=123,
            p75_price_pln=123, max_price_pln=123, confidence=1))
        db.commit()
    path = Path(__file__).resolve().parents[1] / "alembic/versions/0020_statistics_method.py"
    spec = importlib.util.spec_from_file_location("statistics_method_migration", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    with factory.kw["bind"].begin() as connection:
        connection.execute(text("ALTER TABLE route_statistics DROP COLUMN methodology_version"))
        with Operations.context(MigrationContext.configure(connection)):
            module.upgrade()
            row = connection.execute(text(
                "SELECT sample_count, median_price_pln, methodology_version FROM route_statistics"
            )).one()
            assert row.sample_count == 30 and row.median_price_pln == 123
            assert row.methodology_version is None
            module.downgrade()
            assert connection.scalar(text("SELECT count(*) FROM route_statistics")) == 1
            module.upgrade()


def test_statistics_rejects_postgres_numeric_nan_and_future_records(pg_factory):
    from app.services.statistics import recalculate_route_statistics

    factory, _ = pg_factory
    now = datetime.now(UTC)
    with factory() as db:
        for price, stamp in [(200, now), (Decimal("NaN"), now), (0, now), (-1, now),
                             (10000, now + timedelta(hours=1))]:
            db.add(PriceObservation(data_provider_id=1, origin_airport_id=1, destination_id=1,
                product_type="FLIGHT", departure_date=now.date(), trip_duration_days=3,
                observed_price_pln=price, original_price=200, original_currency="PLN",
                source="test", observed_at=stamp))
        db.commit()
        assert recalculate_route_statistics(db, now=now) == 1
        stats = db.scalar(select(RouteStatistics))
        assert stats.sample_count == 1 and stats.median_price_pln == 200
        assert db.query(PriceObservation).count() == 5


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


def test_events_lock_and_catalogue_upsert(pg_factory):
    from app.models.event import LocalEvent
    from app.services.event_sync import save_window, sync_lock
    from tests.test_event_sync import sample
    from tests.test_events import END, START

    factory, _ = pg_factory
    with sync_lock(factory) as first:
        assert first
        with sync_lock(factory) as second:
            assert not second
        with pipeline_lock(factory) as flights:
            assert flights
    with factory() as db:
        destination_id = db.scalar(select(Destination.id))
        args = (db, destination_id, START, END, [sample()], datetime.now(UTC))
        assert save_window(*args)['added'] == 1
        db.commit()
        assert save_window(*args)['added'] == 0
        db.commit()
        assert len(list(db.scalars(select(LocalEvent)))) == 1


def test_editor_concurrent_revisions_have_one_winner(pg_factory):
    from threading import Barrier

    from app.api.editor import Create, Edit, create, revise
    from app.models.editorial import EditorialRevision, EditorSession
    from fastapi import HTTPException

    factory, _ = pg_factory
    owner = EditorSession(owner="fixture")
    with factory() as db:
        item = create(Create(kind="guide"), owner, db)
    barrier = Barrier(2)

    def run():
        with factory() as db:
            barrier.wait(timeout=10)
            try:
                return revise(item["id"], Edit(version=1, variants=item["variants"]), owner, db)["version"]
            except HTTPException as exc:
                return exc.status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = [future.result(timeout=20) for future in [pool.submit(run), pool.submit(run)]]
    assert sorted(results) == [2, 409]
    with factory() as db:
        assert len(list(db.scalars(select(EditorialRevision)))) == 2


def test_editor_upgrade_preserves_existing_catalogue():
    import subprocess
    import sys
    from pathlib import Path

    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set TEST_DATABASE_URL")
    assert make_url(url).database == "hoptrip_test"
    schema = "test_editor_upgrade_" + uuid4().hex
    engine = create_engine(url)
    with engine.begin() as db:
        db.execute(text(f'CREATE SCHEMA "{schema}"'))
    scoped_url = make_url(url).update_query_dict({"options": f"-csearch_path={schema}"})
    scoped = create_engine(scoped_url)
    env = {**os.environ, "DATABASE_URL": scoped_url.render_as_string(hide_password=False)}
    try:
        for revision in ["0016_flight_route_details", "0017_routes_editorial_merge", "head"]:
            result = subprocess.run([sys.executable, "-m", "alembic", "upgrade", revision],
                                    cwd=Path(__file__).parents[1], env=env,
                                    capture_output=True, text=True, timeout=60)
            assert result.returncode == 0, result.stderr
            with scoped.begin() as db:
                if revision == "0016_flight_route_details":
                    db.execute(text("INSERT INTO data_providers (code, name) "
                                    "VALUES ('editor-upgrade-sentinel', 'Existing catalogue')"))
                elif revision == "0017_routes_editorial_merge":
                    item_id = db.scalar(text("INSERT INTO editorial_items "
                        "(kind, source, version, status, created_at) VALUES "
                        "('guide', '{}', 1, 'APPROVED', now()) RETURNING id"))
                    db.execute(text("INSERT INTO editorial_revisions "
                        "(item_id, version, snapshot, variants, artifacts, checksum, owner, created_at) "
                        "VALUES (:id, 1, '{}', '{\"telegram\":\"Existing text\"}', '{}', :checksum, 'fixture', now())"),
                        {"id": item_id, "checksum": "a" * 64})
                    db.execute(text("INSERT INTO editorial_approvals "
                        "(item_id, version, channels, checksum, owner, created_at, expires_at) "
                        "VALUES (:id, 1, '[\"telegram\"]', :checksum, 'fixture', now(), now()+interval '1 day')"),
                        {"id": item_id, "checksum": "a" * 64})
                else:
                    assert db.scalar(text("SELECT name FROM data_providers "
                                          "WHERE code='editor-upgrade-sentinel'")) == "Existing catalogue"
                    assert db.scalar(text("SELECT version_num FROM alembic_version")) == "0021_telegram_alerts"
                    assert db.scalar(text("SELECT variants FROM editorial_revisions")) == {"telegram": "Existing text"}
                    assert db.scalar(text("SELECT checksum FROM editorial_approvals")) == "a" * 64
                    assert db.scalar(text("SELECT count(*) FROM editorial_rehearsals")) == 0
    finally:
        scoped.dispose()
        with engine.begin() as db:
            db.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        engine.dispose()


def test_rehearsal_workers_skip_locked_and_prepare_once(pg_factory):
    from threading import Barrier

    from app.api.editor import Approve, Create, Rehearse, approve, create, rehearse
    from app.models.editorial import (
        EditorialAudit,
        EditorialItem,
        EditorialRehearsal,
        EditorSession,
    )
    from app.services.editor_rehearsal import process_due

    factory, _ = pg_factory
    owner = EditorSession(owner="fixture")
    with factory() as db:
        item = create(Create(kind="guide"), owner, db)
        approve(item["id"], Approve(version=1, channels=["telegram"]), owner, db)
        rehearse(item["id"], Rehearse(version=1), owner, db)
    with factory() as locked, factory() as other:
        locked.scalar(select(EditorialItem).where(EditorialItem.id == item["id"]).with_for_update())
        assert process_due(other) == []
    barrier = Barrier(2)

    def run():
        with factory() as db:
            barrier.wait(timeout=10)
            return process_due(db)

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run) for _ in range(2)]
        assert sum(len(f.result(timeout=20)) for f in futures) == 1
    with factory() as db:
        job = db.scalar(select(EditorialRehearsal))
        assert job.state == "READY" and job.package["publishable"] is False
        assert job.package["accounts"] == []
        assert len(list(db.scalars(select(EditorialAudit).where(
            EditorialAudit.action == "REHEARSAL_CHECKED")))) == 1


def test_rehearsal_concurrent_scheduling_is_idempotent(pg_factory):
    from threading import Barrier

    from app.api.editor import Approve, Create, Rehearse, approve, create, rehearse
    from app.models.editorial import EditorialRehearsal, EditorSession

    factory, _ = pg_factory
    owner = EditorSession(owner="fixture")
    with factory() as db:
        item = create(Create(kind="guide"), owner, db)
        approve(item["id"], Approve(version=1, channels=["telegram"]), owner, db)
    body = Rehearse(version=1, scheduled_at=datetime.now(UTC) + timedelta(minutes=1))
    barrier = Barrier(2)

    def run():
        with factory() as db:
            barrier.wait(timeout=10)
            return rehearse(item["id"], body, owner, db)["id"]

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run) for _ in range(2)]
        assert len({f.result(timeout=20) for f in futures}) == 1
    with factory() as db:
        assert len(list(db.scalars(select(EditorialRehearsal)))) == 1
