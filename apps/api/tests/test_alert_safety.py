"""GROW-01: synthetic lifecycle, dispatch-time validation and log privacy; no network."""

import logging
from contextlib import contextmanager
from datetime import datetime, timedelta

import pytest
from app.config import get_settings
from app.jobs import alert_scheduler
from app.main import app
from app.models.alert import AlertDelivery, DealAlert
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.services import alert_digests, alerts
from app.services.catalog import serialize_deal
from pydantic import SecretStr
from sqlalchemy import select
from test_alert_digests import NOW, offer, settings, subscription


def source(db, deal):
    component = db.scalar(select(DealComponent).where(DealComponent.deal_id == deal.id))
    return db.get(TravelOffer, component.travel_offer_id)


@pytest.mark.parametrize('invalid', ['unverified', 'missing-return'])
def test_critical_quality_is_not_recommended_in_email(isolated_db, monkeypatch, invalid):
    alert = subscription(isolated_db)
    deal = offer(isolated_db)
    travel = source(isolated_db, deal)
    if invalid == 'unverified':
        travel.source = 'fixture-unknown'
    else:
        travel.raw_payload = {k: v for k, v in travel.raw_payload.items()
                              if k != 'return_origin_airport'}
    isolated_db.commit()
    assert not serialize_deal(isolated_db, deal).flight_quality.recommendation_eligible
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: pytest.fail('Unsafe email'))
    assert alert_digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert alert.last_digest_at is None
    assert not list(isolated_db.scalars(select(AlertDelivery)))


def test_invalid_cheaper_candidates_do_not_hide_valid_partial_match(isolated_db, monkeypatch):
    subscription(isolated_db)
    for _ in range(6):
        deal = offer(isolated_db, price='1')
        source(isolated_db, deal).source = 'fixture-unknown'
    good = offer(isolated_db)
    isolated_db.commit()
    assert serialize_deal(isolated_db, good).flight_quality.status == 'PARTIAL'
    messages = []
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: messages.append(args))
    assert alert_digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 1
    assert isolated_db.scalar(select(AlertDelivery)).deal_ids == [good.id]
    assert good.slug in messages[0][3]
    assert 'brak danych' in messages[0][3]


@pytest.mark.parametrize('mutation', ['hidden', 'over-budget', 'source-expired', 'critical'])
def test_offer_changes_after_reservation_cancel_email(isolated_db, monkeypatch, mutation):
    subscription(isolated_db)
    deal = offer(isolated_db)
    real_commit = isolated_db.commit

    def commit():
        reserved = any(isinstance(obj, AlertDelivery) for obj in isolated_db.new)
        real_commit()
        if reserved:
            if mutation == 'hidden':
                deal.is_visible = False
            elif mutation == 'over-budget':
                deal.price_per_person_pln = 251
            elif mutation == 'source-expired':
                source(isolated_db, deal).expires_at = NOW
            else:
                source(isolated_db, deal).raw_payload = {}
            real_commit()

    monkeypatch.setattr(isolated_db, 'commit', commit)
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: pytest.fail('Stale email'))
    assert alert_digests.deliver_digests(isolated_db, settings(), NOW)['cancelled'] == 1
    assert isolated_db.scalar(select(AlertDelivery)).status == 'CANCELLED'


def test_worker_uses_fresh_clock_after_reservation(isolated_db, monkeypatch):
    subscription(isolated_db)
    offer(isolated_db)
    current = [NOW]

    class Clock(datetime):
        @classmethod
        def now(cls, tz=None):
            return current[0]

    real_commit = isolated_db.commit

    def commit():
        reserved = any(isinstance(obj, AlertDelivery) for obj in isolated_db.new)
        real_commit()
        if reserved:
            current[0] = NOW + timedelta(hours=49)

    monkeypatch.setattr(alert_digests, 'datetime', Clock)
    monkeypatch.setattr(isolated_db, 'commit', commit)
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: pytest.fail('Expired email'))
    assert alert_digests.deliver_digests(isolated_db, settings())['cancelled'] == 1


def test_digest_body_uses_revalidated_price(isolated_db, monkeypatch):
    subscription(isolated_db)
    deal = offer(isolated_db)
    real_commit = isolated_db.commit

    def commit():
        reserved = any(isinstance(obj, AlertDelivery) for obj in isolated_db.new)
        real_commit()
        if reserved:
            deal.price_per_person_pln = 220
            real_commit()

    messages = []
    monkeypatch.setattr(isolated_db, 'commit', commit)
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: messages.append(args))
    assert alert_digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 1
    assert '220,00 zł/os.' in messages[0][3]
    assert '200,00 zł/os.' not in messages[0][3]


def test_lifecycle_logs_no_email_capability_preferences_or_smtp_secrets(
    api_client, isolated_db, monkeypatch, caplog,
):
    config = settings()
    config.smtp_password = SecretStr('private-smtp-sentinel-grow01')
    app.dependency_overrides[get_settings] = lambda: config
    offer(isolated_db)
    monkeypatch.setattr(alerts, 'send_alert_mail', lambda *args: None)
    caplog.set_level(logging.INFO)
    filters = {'origin': 'WRO', 'budget': '239.12'}
    assert api_client.post('/api/v1/alerts', json={
        'email': 'private-grow01@example.test', 'consent': True, 'filters': filters,
    }).status_code == 202
    alert = isolated_db.scalar(select(DealAlert))
    token = alerts.capability(config, alert, 'confirm')
    result = api_client.post('/api/v1/alerts/confirm', json={'token': token})
    assert result.status_code == 200
    manage = result.json()['token']
    assert api_client.patch('/api/v1/alerts/manage', json={
        'token': manage, 'filters': {**filters, 'frequency': 'daily'},
    }).status_code == 200
    assert api_client.post('/api/v1/alerts/unsubscribe', json={'token': manage}).status_code == 200
    for event in ['Alert signup committed', 'Alert confirmation activated',
                  'Alert preferences updated', 'Alert subscription stopped']:
        assert event in caplog.text
    for private in [alert.email, token, manage, alert.id, '239.12', config.smtp_password.get_secret_value()]:
        assert private not in caplog.text


def test_cleanup_command_works_with_delivery_disabled_without_starting_scheduler(
    isolated_db, monkeypatch,
):
    active = subscription(isolated_db)
    pending = subscription(isolated_db)
    pending.status, pending.requested_at = 'PENDING', NOW - timedelta(days=8)
    stopped = subscription(isolated_db)
    stopped.status, stopped.stopped_at = 'STOPPED', NOW - timedelta(days=31)
    isolated_db.add(AlertDelivery(alert_id=active.id, deal_ids=[123], status='SENT', created_at=NOW))
    isolated_db.commit()
    config = settings()
    config.alerts_enabled = config.alerts_digest_enabled = False

    @contextmanager
    def session():
        yield isolated_db

    class Clock(datetime):
        @classmethod
        def now(cls, tz=None):
            return NOW

    monkeypatch.setattr(alert_scheduler, 'datetime', Clock)
    monkeypatch.setattr(alert_scheduler, 'SessionLocal', session)
    monkeypatch.setattr(alert_scheduler, 'get_settings', lambda: config)
    monkeypatch.setattr(alert_scheduler, 'run_scheduler', lambda: pytest.fail('Worker started'))
    monkeypatch.setattr(alert_digests, 'send_alert_mail', lambda *args: pytest.fail('Email sent'))
    alert_scheduler.main(['--cleanup-only'])
    assert list(isolated_db.scalars(select(DealAlert.id))) == [active.id]
    assert isolated_db.scalar(select(AlertDelivery)).alert_id == active.id
