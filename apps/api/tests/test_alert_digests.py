from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

import pytest
from app.config import Settings
from app.jobs import alert_scheduler
from app.models.alert import AlertDelivery, DealAlert
from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import TravelOffer
from app.schemas.alert import AlertFilters
from app.services import alert_digests as digests
from app.services.alerts import capability
from pydantic import ValidationError
from sqlalchemy import func, select

NOW = datetime(2026, 10, 12, 7, tzinfo=UTC)  # Monday 09:00 Warsaw


def settings():
    return Settings(_env_file=None, alerts_enabled=True, alerts_digest_enabled=True,
                    alerts_signing_key='test-only-key-' * 4, alerts_site_url='https://example.test',
                    smtp_host='smtp.example.test', smtp_user='test', smtp_password='test',
                    smtp_sender='alerts@example.test')


def subscription(db, **filters):
    alert = DealAlert(id=uuid4().hex, email=uuid4().hex + '@example.test', status='ACTIVE',
                      confirmed_at=NOW - timedelta(days=1), requested_at=NOW - timedelta(days=2),
                      consent_version='test', filters=AlertFilters(
                          **{'origin': 'WRO', 'budget': '250', 'duration_min': 1,
                             'duration_max': 4, **filters}).model_dump(mode='json'))
    db.add(alert)
    db.commit()
    return alert


def offer(db, *, price='200', departure=None, nights=2, return_flight=True, **changes):
    airport = db.scalar(select(Airport).where(Airport.iata_code == 'WRO'))
    destination = db.scalar(select(Destination).where(Destination.slug == 'milan'))
    provider = db.scalar(select(DataProvider).where(DataProvider.code == 'digest-test'))
    if not airport:
        airport = Airport(iata_code='WRO', name='Wrocław', city='Wrocław', country_code='PL')
        db.add(airport)
    if not destination:
        destination = Destination(city='Milan', country='Italy', country_code='IT', slug='milan')
        db.add(destination)
    if not provider:
        provider = DataProvider(code='digest-test', name='Test')
        db.add(provider)
    db.flush()
    departure = departure or datetime(2026, 11, 6, 9, tzinfo=UTC)  # Friday
    arrival = departure + timedelta(days=nights)
    travel = TravelOffer(data_provider_id=provider.id, external_id=uuid4().hex, source='fixture',
                         origin_airport_id=airport.id, destination_id=destination.id,
                         depart_at=departure, return_at=arrival if return_flight else None,
                         original_price=Decimal(price), original_currency='PLN', price_pln=Decimal(price),
                         last_verified_at=NOW, fetched_at=NOW)
    db.add(travel)
    db.flush()
    values = dict(slug='fixture-' + uuid4().hex, origin_airport_id=airport.id,
                  destination_id=destination.id, trip_start=departure.date(), trip_end=arrival.date(),
                  depart_at=departure, nights=nights, flight_price_pln=Decimal(price),
                  total_estimated_pln=Decimal(price), price_per_person_pln=Decimal(price),
                  deal_score=75, confidence=Decimal('0.5'), last_verified_at=NOW,
                  expires_at=NOW + timedelta(days=2))
    deal = Deal(**{**values, **changes})
    db.add(deal)
    db.flush()
    db.add(DealComponent(deal_id=deal.id, component_type='FLIGHT', travel_offer_id=travel.id,
                         price_pln=Decimal(price)))
    db.commit()
    return deal


@pytest.fixture
def mail(monkeypatch):
    messages = []
    monkeypatch.setattr(digests, 'send_alert_mail', lambda *args: messages.append(args))
    return messages


def test_five_sorted_new_matches_then_no_repeat_and_working_unsubscribe(isolated_db, api_client, mail):
    db = isolated_db
    config = settings()
    alert = subscription(db, weekend=True)
    deals = [offer(db, price=str(price)) for price in range(206, 199, -1)]
    assert digests.deliver_digests(db, config, NOW)['sent'] == 1
    delivery = db.scalar(select(AlertDelivery))
    assert delivery.deal_ids == [d.id for d in reversed(deals)][:5]
    body = mail[0][3]
    assert body.count('/deals/') == 5
    for text in ['Wrocław (WRO) → Mediolan', '06.11.2026 – 08.11.2026', '200,00 zł/os.',
                 'liczba nocy: 2', 'Bagaż', 'Nocleg', 'brak danych', 'Cena i dostępność', '/manage#token=']:
        assert text in body
    assert digests.deliver_digests(db, config, NOW)['sent'] == 0
    assert digests.deliver_digests(db, config, NOW + timedelta(days=1))['sent'] == 0
    for deal in deals:
        deal.last_verified_at = NOW + timedelta(days=7)
        deal.expires_at = NOW + timedelta(days=8)
        component = db.scalar(select(DealComponent).where(DealComponent.deal_id == deal.id))
        db.get(TravelOffer, component.travel_offer_id).last_verified_at = deal.last_verified_at
    db.commit()
    assert digests.deliver_digests(db, config, NOW + timedelta(days=7))['sent'] == 1
    assert mail[1][3].count('/deals/') == 2
    from app.config import get_settings
    from app.main import app
    app.dependency_overrides[get_settings] = lambda: config
    token = capability(config, alert, 'manage')
    assert api_client.post('/api/v1/alerts/unsubscribe', json={'token': token}).status_code == 200
    offer(db)
    assert digests.deliver_digests(db, config, NOW + timedelta(days=14))['sent'] == 0
    assert len(mail) == 2


@pytest.mark.parametrize('change', [
    {'price': '251'}, {'nights': 5}, {'return_flight': False}, {'is_visible': False},
    {'status': 'EXPIRED'}, {'expires_at': NOW}, {'last_verified_at': NOW - timedelta(hours=49)},
    {'departure': NOW - timedelta(days=1)}, {'departure': datetime(2026, 11, 5, 9, tzinfo=UTC)},
    {'nights': 0},
])
def test_unsuitable_deals_never_fill_digest(isolated_db, mail, change):
    subscription(isolated_db, weekend=True)
    offer(isolated_db, **change)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert mail == []
    assert isolated_db.scalar(select(func.count()).select_from(AlertDelivery)) == 0


@pytest.mark.parametrize('filters', [
    {'origin': 'WAW'}, {'destination': 'rome'}, {'departure_from': '2026-11-07'},
    {'departure_to': '2026-11-05'}, {'duration_min': 3},
])
def test_saved_filters_are_all_applied(isolated_db, mail, filters):
    subscription(isolated_db, **filters)
    offer(isolated_db)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert not mail


def test_no_matches_does_not_consume_slot(isolated_db, mail):
    alert = subscription(isolated_db)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert alert.last_digest_at is None
    offer(isolated_db)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 1


@pytest.mark.parametrize('state', ['PENDING', 'STOPPED', 'unconfirmed', 'invalid-filters'])
def test_only_valid_confirmed_subscriptions(isolated_db, mail, state):
    alert = subscription(isolated_db)
    if state == 'unconfirmed':
        alert.confirmed_at = None
    elif state == 'invalid-filters':
        alert.filters = {'bad': 'record'}
    else:
        alert.status = state
    isolated_db.commit()
    offer(isolated_db)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert not mail


def test_ambiguous_smtp_is_not_retried_even_next_week(isolated_db, monkeypatch):
    subscription(isolated_db)
    deal = offer(isolated_db)
    calls = []

    def fail(*args):
        calls.append(True)
        raise TimeoutError('potentially accepted; private provider details')

    monkeypatch.setattr(digests, 'send_alert_mail', fail)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['uncertain'] == 1
    assert isolated_db.scalar(select(AlertDelivery)).status == 'UNCERTAIN'
    deal.last_verified_at = NOW + timedelta(days=7)
    deal.expires_at = NOW + timedelta(days=8)
    isolated_db.commit()
    assert digests.deliver_digests(isolated_db, settings(), NOW + timedelta(days=7))['sent'] == 0
    assert len(calls) == 1


def test_crash_after_reservation_survives_restart(isolated_db, monkeypatch, mail):
    subscription(isolated_db)
    offer(isolated_db)

    def crash(*args):
        raise KeyboardInterrupt

    monkeypatch.setattr(digests, 'send_alert_mail', crash)
    with pytest.raises(KeyboardInterrupt):
        digests.deliver_digests(isolated_db, settings(), NOW)
    isolated_db.rollback()
    assert isolated_db.scalar(select(AlertDelivery)).status == 'RESERVED'
    monkeypatch.setattr(digests, 'send_alert_mail', lambda *args: mail.append(args))
    assert digests.deliver_digests(isolated_db, settings(), NOW)['sent'] == 0
    assert not mail


@pytest.mark.parametrize('mutation', ['stop', 'filters'])
def test_change_between_reservation_and_send_cancels(isolated_db, monkeypatch, mail, mutation):
    alert = subscription(isolated_db)
    offer(isolated_db)
    real_commit = isolated_db.commit

    def commit():
        reserved = any(isinstance(obj, AlertDelivery) for obj in isolated_db.new)
        real_commit()
        if reserved:
            if mutation == 'stop':
                alert.status = 'STOPPED'
                alert.stopped_at = NOW
            else:
                alert.filters = {**alert.filters, 'budget': '1'}
            real_commit()

    monkeypatch.setattr(isolated_db, 'commit', commit)
    assert digests.deliver_digests(isolated_db, settings(), NOW)['cancelled'] == 1
    assert not mail


@pytest.mark.parametrize('frequency,last,now,expected', [
    ('weekly', None, '2026-10-12T06:59:00+00:00', False),
    ('weekly', None, '2026-10-12T07:00:00+00:00', True),
    ('weekly', None, '2026-10-13T07:00:00+00:00', False),
    ('weekly', '2026-10-12T07:00:00+00:00', '2026-10-12T15:00:00+00:00', False),
    ('weekly', '2026-10-19T07:00:00+00:00', '2026-10-26T08:00:00+00:00', True),
    ('daily', '2026-03-28T08:00:00+00:00', '2026-03-29T07:00:00+00:00', True),
    ('daily', '2026-10-24T07:00:00+00:00', '2026-10-25T08:00:00+00:00', True),
    ('daily', '2026-10-25T08:00:00+00:00', '2026-10-25T10:00:00+00:00', False),
])
def test_warsaw_calendar_and_dst(frequency, last, now, expected):
    filters = AlertFilters(origin='WRO', budget=250, frequency=frequency)
    assert digests.due(settings(), filters, datetime.fromisoformat(last) if last else None,
                       datetime.fromisoformat(now)) is expected


def test_custom_schedule_and_disabled_gate(isolated_db, monkeypatch, mail):
    config = settings()
    config.alerts_digest_weekday = 1
    config.alerts_digest_hour = 17
    config.alerts_digest_minute = 30
    filters = AlertFilters(origin='WRO', budget=250)
    assert not digests.due(config, filters, None, datetime(2026, 10, 13, 15, 29, tzinfo=UTC))
    assert digests.due(config, filters, None, datetime(2026, 10, 13, 15, 30, tzinfo=UTC))
    config.alerts_digest_enabled = False
    subscription(isolated_db)
    offer(isolated_db)
    assert digests.deliver_digests(isolated_db, config, NOW)['sent'] == 0
    monkeypatch.setattr(alert_scheduler, 'get_settings', lambda: config)
    monkeypatch.setattr(alert_scheduler, 'run_once', lambda: pytest.fail('Disabled worker ran'))
    alert_scheduler.run_scheduler()
    assert not mail


@pytest.mark.parametrize('values', [
    {'alerts_digest_enabled': True, 'alerts_enabled': False},
    {'alerts_digest_hour': 24}, {'alerts_digest_minute': 60}, {'alerts_digest_weekday': 7},
])
def test_invalid_schedule_config(values):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **values)


def test_retention_keeps_active_dedup_history(isolated_db):
    active = subscription(isolated_db)
    pending = subscription(isolated_db)
    pending.status = 'PENDING'
    pending.requested_at = NOW - timedelta(days=8)
    stopped = subscription(isolated_db)
    stopped.status = 'STOPPED'
    stopped.stopped_at = NOW - timedelta(days=31)
    for alert in (active, pending, stopped):
        isolated_db.add(AlertDelivery(alert_id=alert.id, deal_ids=[10], status='SENT',
                                     created_at=NOW - timedelta(days=100)))
    isolated_db.commit()
    digests.cleanup(isolated_db, NOW)
    assert list(isolated_db.scalars(select(DealAlert.id))) == [active.id]
    assert list(isolated_db.scalars(select(AlertDelivery.alert_id))) == [active.id]


def test_scheduler_continues_after_failure_without_logging_secrets(monkeypatch, caplog):
    calls = []
    monkeypatch.setattr(alert_scheduler, 'get_settings', settings)

    def run():
        calls.append(True)
        if len(calls) == 1:
            raise RuntimeError('smtp-password-must-not-be-logged')
        return {'sent': 0}

    def sleep(seconds):
        assert seconds == 60
        if len(calls) == 2:
            raise KeyboardInterrupt

    monkeypatch.setattr(alert_scheduler, 'run_once', run)
    monkeypatch.setattr(alert_scheduler.time, 'sleep', sleep)
    with pytest.raises(KeyboardInterrupt):
        alert_scheduler.run_scheduler()
    assert len(calls) == 2
    assert 'smtp-password-must-not-be-logged' not in caplog.text
