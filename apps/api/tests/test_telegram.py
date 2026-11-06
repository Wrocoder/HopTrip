"""Personal bot integration using synthetic chats, offers and an in-memory sender."""

import json
import logging
from datetime import UTC, datetime, timedelta
from io import BytesIO
from urllib.error import HTTPError, URLError

import pytest
from app.config import Settings, get_settings
from app.main import app
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.models.telegram import TelegramDelivery, TelegramSubscription, TelegramUpdate
from app.services import telegram_delivery as delivery
from app.services import telegram_subscriptions as subscriptions
from app.services.telegram_text import COPY, LOCALES, message
from app.services.telegram_transport import TelegramClient, TelegramFailure
from pydantic import ValidationError
from sqlalchemy import func, select
from test_alert_digests import NOW, offer


def config(**changes):
    return Settings(_env_file=None, telegram_enabled=True, telegram_delivery_enabled=True,
                    telegram_bot_token='123456:synthetic-token-only-for-local-tests',
                    telegram_webhook_secret='synthetic-webhook-secret-only-for-local-tests',
                    telegram_bot_username='HopTrip_TestBot', telegram_site_url='https://example.test',
                    **changes)


def update(update_id=1, text='/start', chat=900001, language='pl', now=NOW):
    return {'update_id': update_id, 'message': {'date': int(now.timestamp()), 'text': text,
            'chat': {'id': chat, 'type': 'private'},
            'from': {'id': chat, 'is_bot': False, 'language_code': language}}}


def command(db, text, update_id=1, *, settings=None, chat=900001, locale='pl', now=NOW):
    subscriptions.receive_update(db, settings or config(),
                                 update(update_id, text, chat, locale, now), now)


def active(db, *, chat=900001, locale='pl', extra=''):
    offer(db)
    command(db, '/subscribe origin=WRO budget=250 ' + extra, chat=chat, locale=locale)
    command(db, '/confirm', 2, chat=chat, locale=locale)
    # Helpers remove requested service replies, never digest history.
    for row in db.scalars(select(TelegramDelivery).where(TelegramDelivery.kind == 'REPLY')):
        db.delete(row)
    db.commit()
    return db.scalar(select(TelegramSubscription).where(TelegramSubscription.chat_id == chat))


class Sender:
    def __init__(self, failure=None):
        self.messages = []
        self.failure = failure

    def send(self, chat_id, text):
        self.messages.append((chat_id, text))
        if self.failure:
            raise self.failure


def test_webhook_disabled_and_authentication_precede_mutation(api_client, isolated_db):
    settings = config()
    app.dependency_overrides[get_settings] = lambda: settings
    assert api_client.get('/api/v1/telegram/status').json() == {
        'enabled': True, 'delivery_enabled': True,
    }
    payload = update(now=datetime.now(UTC))
    assert api_client.post('/api/v1/telegram/webhook', json=payload).status_code == 403
    assert not list(isolated_db.scalars(select(TelegramUpdate)))
    secret = settings.telegram_webhook_secret.get_secret_value()
    headers = {'X-Telegram-Bot-Api-Secret-Token': secret}
    assert api_client.post('/api/v1/telegram/webhook', json=payload, headers=headers).json() == {'ok': True}
    assert isolated_db.scalar(select(func.count()).select_from(TelegramDelivery)) == 1
    settings.telegram_enabled = False
    assert api_client.post('/api/v1/telegram/webhook', json=payload, headers=headers).status_code == 503
    assert api_client.get('/api/v1/telegram/status').json() == {
        'enabled': False, 'delivery_enabled': False,
    }


@pytest.mark.parametrize('locale', LOCALES)
def test_explicit_opt_in_management_and_stop(isolated_db, locale):
    db, sender, settings = isolated_db, Sender(), config()
    offer(db)
    command(db, '/start', locale=locale)
    assert db.scalar(select(func.count()).select_from(TelegramSubscription)) == 0
    assert delivery.deliver_once(db, settings, sender, NOW)['sent'] == 1  # Requested help only.
    assert message('help', locale) in sender.messages[0][1]
    command(db, '/subscribe origin=WRO budget=250 frequency=daily', 2, locale=locale)
    sub = db.scalar(select(TelegramSubscription))
    assert sub.status == 'PENDING' and sub.opted_in_at is None
    assert not list(db.scalars(select(TelegramDelivery).where(TelegramDelivery.kind == 'DIGEST')))
    command(db, '/confirm', 3, locale=locale)
    assert sub.status == 'ACTIVE' and sub.opted_in_at and sub.consent_version
    command(db, '/set budget=230 destination=anywhere max_connections=0', 4, locale=locale)
    assert sub.filters['budget'] == '230' and sub.filters['max_connections'] == 0
    assert sub.filters['frequency'] == 'daily'
    command(db, '/settings', 5, locale=locale)
    assert 'budget=230' in list(db.scalars(select(TelegramDelivery)))[-1].text
    command(db, '/stop', 6, locale=locale)
    assert sub.status == 'STOPPED' and sub.stopped_at
    command(db, '/confirm', 7, locale=locale)
    assert sub.status == 'STOPPED'
    command(db, '/subscribe origin=WRO budget=210', 8, locale=locale)
    assert sub.status == 'PENDING' and sub.opted_in_at is None


@pytest.mark.parametrize('mutation', ['group', 'channel', 'different-user', 'bot', 'old', 'future',
                                    'boolean-chat', 'edited', 'other-bot', 'malformed'])
def test_untrusted_or_unsuitable_updates_do_nothing(isolated_db, mutation):
    payload = update(text='/subscribe origin=WRO budget=250')
    item = payload['message']
    if mutation in {'group', 'channel'}:
        item['chat']['type'] = mutation
    elif mutation == 'different-user':
        item['from']['id'] += 1
    elif mutation == 'bot':
        item['from']['is_bot'] = True
    elif mutation == 'old':
        item['date'] -= 86401
    elif mutation == 'future':
        item['date'] += 301
    elif mutation == 'boolean-chat':
        item['chat']['id'] = item['from']['id'] = True
    elif mutation == 'edited':
        payload['edited_message'] = payload.pop('message')
    elif mutation == 'other-bot':
        item['text'] = '/start@AnotherBot'
    else:
        payload['message'] = []
    subscriptions.receive_update(isolated_db, config(), payload, NOW)
    assert not list(isolated_db.scalars(select(TelegramSubscription)))
    assert not list(isolated_db.scalars(select(TelegramDelivery)))


@pytest.mark.parametrize('arguments', ['origin=BAD budget=250', 'origin=WRO budget=-1',
    'origin=WRO budget=250 frequency=hourly', 'origin=WRO budget=250 max_connections=-1',
    'origin=WRO budget=250 chat_id=123', 'origin=WRO budget=250 budget=1',
    'origin=WRO budget=250 destination=nonexistent',
    'origin=WRO budget=250 departure_from=2030-02-02 departure_to=2030-02-01'])
def test_invalid_preferences_never_create_subscription(isolated_db, arguments):
    offer(isolated_db)
    command(isolated_db, '/subscribe ' + arguments)
    assert not list(isolated_db.scalars(select(TelegramSubscription)))
    assert message('invalid', 'pl') in isolated_db.scalar(select(TelegramDelivery)).text


def test_duplicate_and_out_of_order_updates_do_not_reactivate(isolated_db):
    active(isolated_db)
    command(isolated_db, '/stop', 10)
    command(isolated_db, '/confirm', 9)
    command(isolated_db, '/subscribe origin=WRO budget=1', 8)
    command(isolated_db, '/stop', 10)
    assert isolated_db.scalar(select(TelegramSubscription)).status == 'STOPPED'
    assert isolated_db.scalar(select(func.count()).select_from(TelegramDelivery)) == 1


@pytest.mark.parametrize('cleanup_first', [False, True])
def test_fresh_update_id_can_restart_after_week_of_inactivity(isolated_db, cleanup_first):
    sub = active(isolated_db)
    later = NOW + timedelta(days=8)
    if cleanup_first:
        subscriptions.cleanup(isolated_db, later)
    # Reuses an old receipt and is below the persisted previous ID.
    command(isolated_db, '/stop', 1, now=later)
    assert sub.status == 'STOPPED'
    command(isolated_db, '/confirm', 0, now=later)
    assert sub.status == 'STOPPED'


def test_rate_limits_do_not_prevent_stop_and_confirmation_expires(isolated_db):
    settings = config(telegram_commands_per_minute=2)
    offer(isolated_db)
    command(isolated_db, '/subscribe origin=WRO budget=250', settings=settings)
    command(isolated_db, '/confirm', 2, settings=settings)
    command(isolated_db, '/set budget=1', 3, settings=settings)
    sub = isolated_db.scalar(select(TelegramSubscription))
    assert sub.filters['budget'] == '250'
    command(isolated_db, '/stop', 4, settings=settings)
    assert sub.status == 'STOPPED'
    command(isolated_db, '/subscribe origin=WRO budget=250', 5, now=NOW + timedelta(days=1))
    command(isolated_db, '/confirm', 6, now=NOW + timedelta(days=2, seconds=1))
    assert sub.status == 'PENDING'


@pytest.mark.parametrize('locale', LOCALES)
def test_only_new_matching_flights_are_sent_with_observation_warnings(isolated_db, locale):
    active(isolated_db, locale=locale)
    offer(isolated_db, price='300')
    settings, sender = config(), Sender()
    assert delivery.deliver_once(isolated_db, settings, sender, NOW)['sent'] == 1
    assert len(sender.messages) == 1 and sender.messages[0][0] == 900001
    text = sender.messages[0][1]
    assert message('header', locale) in text and message('disclaimer', locale) in text
    assert '200.00 PLN' in text and '300.00' not in text and '/stop' in text
    assert len(text.encode('utf-16-le')) // 2 <= 4096
    assert delivery.deliver_once(isolated_db, settings, sender, NOW + timedelta(seconds=2))['sent'] == 0
    command(isolated_db, '/stop', 3)
    # Remove the requested stop acknowledgement for this digest-only assertion.
    for row in isolated_db.scalars(select(TelegramDelivery).where(TelegramDelivery.kind == 'REPLY')):
        isolated_db.delete(row)
    isolated_db.commit()
    assert delivery.deliver_once(isolated_db, settings, sender, NOW + timedelta(days=7))['sent'] == 0


def test_refreshed_old_deal_is_not_resent_but_new_deal_can_fill_next_week(isolated_db):
    active(isolated_db)
    sender = Sender()
    delivery.deliver_once(isolated_db, config(), sender, NOW)
    original = sender.messages[0][1]
    new = offer(isolated_db, price='210')
    from app.models.deal import Deal
    for deal in isolated_db.scalars(select(Deal)):
        deal.last_verified_at, deal.expires_at = NOW + timedelta(days=7), NOW + timedelta(days=8)
    for travel in isolated_db.scalars(select(TravelOffer)):
        travel.last_verified_at = NOW + timedelta(days=7)
    isolated_db.commit()
    assert delivery.deliver_once(isolated_db, config(), sender, NOW + timedelta(days=7))['sent'] == 1
    assert new.slug in sender.messages[1][1] and new.slug not in original
    assert '200.00 PLN' not in sender.messages[1][1]


@pytest.mark.parametrize('state', ['PENDING', 'STOPPED', 'unconfirmed', 'wrong-consent', 'invalid-filters'])
def test_digest_requires_current_confirmed_opt_in(isolated_db, state):
    sub = active(isolated_db)
    if state == 'unconfirmed':
        sub.opted_in_at = None
    elif state == 'wrong-consent':
        sub.consent_version = 'not-consented'
    elif state == 'invalid-filters':
        sub.filters = {'unknown': 'record'}
    else:
        sub.status = state
    isolated_db.commit()
    sender = Sender()
    assert delivery.deliver_once(isolated_db, config(), sender, NOW)['sent'] == 0
    assert sender.messages == []


@pytest.mark.parametrize('now', [NOW, datetime(2031, 12, 31, 22, 59, 55, tzinfo=UTC)],
                         ids=['fixed-clock', 'warsaw-new-year-boundary'])
def test_real_api_to_queue_to_mock_telegram_journey(api_client, isolated_db, monkeypatch, now):
    class FrozenDatetime(datetime):
        @classmethod
        def now(cls, tz=None):
            return now.astimezone(tz) if tz is not None else now.replace(tzinfo=None)

    # Exercise the real webhook/service path with the same clock as the dispatcher.
    monkeypatch.setattr(subscriptions, 'datetime', FrozenDatetime)
    settings, sender = config(), Sender()
    settings.alerts_digest_hour = settings.alerts_digest_minute = 0
    app.dependency_overrides[get_settings] = lambda: settings
    deal = offer(isolated_db, departure=now + timedelta(days=25))
    deal.last_verified_at, deal.expires_at = now, now + timedelta(hours=2)
    for travel in isolated_db.scalars(select(TravelOffer)):
        travel.last_verified_at = now
    isolated_db.commit()
    header = {'X-Telegram-Bot-Api-Secret-Token': settings.telegram_webhook_secret.get_secret_value()}

    def post(text, number):
        response = api_client.post('/api/v1/telegram/webhook', headers=header,
                                   json=update(number, text, now=now))
        assert response.status_code == 200

    post('/subscribe origin=WRO budget=190 frequency=daily', 1)
    # Dispatch after the command's fixed queue timestamp, without wall-clock timing races.
    assert delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=1))['sent'] == 1
    assert message('confirm', 'pl') in sender.messages[-1][1]
    post('/confirm', 2)
    delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=3))
    assert delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=5))['sent'] == 0
    post('/set budget=230', 3)
    delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=7))
    assert delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=9))['sent'] == 1
    assert deal.slug in sender.messages[-1][1]
    digest = isolated_db.scalar(select(TelegramDelivery).where(TelegramDelivery.kind == 'DIGEST'))
    assert digest.status == 'SENT' and digest.deal_ids == [deal.id]
    assert delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=10))['sent'] == 0
    post('/stop', 4)
    delivery.deliver_once(isolated_db, settings, sender, now + timedelta(seconds=11))
    assert isolated_db.scalar(select(TelegramSubscription)).status == 'STOPPED'


@pytest.mark.parametrize('maximum,outbound,returning,expected', [
    (0, None, None, False), (0, 0, None, False), (0, 0, 1, False), (0, 0, 0, True),
    (1, 0, 1, True), (1, 2, 0, False),
])
def test_both_connection_limits_require_known_counts(isolated_db, maximum, outbound, returning, expected):
    active(isolated_db, extra=f'max_connections={maximum}')
    component = isolated_db.scalar(select(DealComponent))
    travel = isolated_db.get(TravelOffer, component.travel_offer_id)
    travel.raw_payload = {**travel.raw_payload, 'transfers': outbound, 'return_transfers': returning}
    isolated_db.commit()
    assert bool(delivery.deliver_once(isolated_db, config(), Sender(), NOW)['sent']) is expected


@pytest.mark.parametrize('filters', ['destination=rome', 'duration_min=3',
    'departure_from=2030-01-01', 'departure_to=2026-11-05'])
def test_other_preference_filters_are_applied(isolated_db, filters):
    active(isolated_db, extra=filters)
    assert delivery.deliver_once(isolated_db, config(), Sender(), NOW)['sent'] == 0


@pytest.mark.parametrize('mutation', ['stop', 'filters', 'expired', 'critical'])
def test_revalidation_after_reservation_cancels_without_network(isolated_db, monkeypatch, mutation):
    sub = active(isolated_db)
    real_commit = isolated_db.commit

    def commit():
        reserved = any(isinstance(row, TelegramDelivery) and row.kind == 'DIGEST'
                       for row in isolated_db.new)
        real_commit()
        if reserved:
            if mutation == 'stop':
                sub.status = 'STOPPED'
            elif mutation == 'filters':
                sub.filters = {**sub.filters, 'budget': '1'}
            else:
                travel = isolated_db.get(TravelOffer, isolated_db.scalar(select(DealComponent)).travel_offer_id)
                if mutation == 'expired':
                    travel.expires_at = NOW
                else:
                    travel.raw_payload = {}
            real_commit()

    monkeypatch.setattr(isolated_db, 'commit', commit)
    sender = Sender()
    assert delivery.deliver_once(isolated_db, config(), sender, NOW)['cancelled'] == 1
    assert sender.messages == []


@pytest.mark.parametrize('failure', [TimeoutError('private token'), TelegramFailure(), KeyboardInterrupt()])
def test_ambiguous_submission_or_crash_is_not_replayed(isolated_db, failure):
    active(isolated_db)
    sender = Sender(failure)
    if isinstance(failure, KeyboardInterrupt):
        with pytest.raises(KeyboardInterrupt):
            delivery.deliver_once(isolated_db, config(), sender, NOW)
        isolated_db.rollback()
    else:
        assert delivery.deliver_once(isolated_db, config(), sender, NOW)['uncertain'] == 1
    assert len(sender.messages) == 1
    assert delivery.deliver_once(isolated_db, config(), Sender(), NOW + timedelta(days=7))['sent'] == 0


def test_429_cooldown_persists_and_403_stops_subscription(isolated_db):
    sub = active(isolated_db)
    sender = Sender(TelegramFailure('RATE_LIMITED', 20))
    assert delivery.deliver_once(isolated_db, config(), sender, NOW)['rate_limited'] == 1
    assert delivery.deliver_once(isolated_db, config(), sender, NOW + timedelta(seconds=19))['idle'] == 1
    assert len(sender.messages) == 1
    sender.failure = TelegramFailure('BLOCKED')
    assert delivery.deliver_once(isolated_db, config(), sender, NOW + timedelta(seconds=20))['blocked'] == 1
    assert sub.status == 'STOPPED' and sub.stopped_at


def test_retry_cap_still_honors_last_global_429_cooldown(isolated_db):
    active(isolated_db)
    sender = Sender(TelegramFailure('RATE_LIMITED', 20))
    for seconds in [0, 20, 40]:
        assert delivery.deliver_once(isolated_db, config(), sender,
                                     NOW + timedelta(seconds=seconds))['rate_limited'] == 1
    row = isolated_db.scalar(select(TelegramDelivery))
    assert row.status == 'CANCELLED' and row.attempts == 3
    command(isolated_db, '/start', 3, chat=900002, now=NOW + timedelta(seconds=40))
    assert delivery.deliver_once(isolated_db, config(), Sender(),
                                 NOW + timedelta(seconds=59))['idle'] == 1
    assert len(sender.messages) == 3


def test_worker_defaults_to_disabled_and_never_starts_a_sender(monkeypatch):
    from app.jobs import telegram_scheduler
    monkeypatch.setattr(telegram_scheduler, 'get_settings', lambda: Settings(_env_file=None))
    monkeypatch.setattr(telegram_scheduler, 'run_once', lambda: pytest.fail('Disabled worker ran'))
    telegram_scheduler.main(['--once'])


def test_global_pacing_applies_to_requested_replies_across_chats(isolated_db):
    command(isolated_db, '/start', chat=900001)
    command(isolated_db, '/start', 2, chat=900002)
    sender = Sender()
    assert delivery.deliver_once(isolated_db, config(), sender, NOW)['sent'] == 1
    assert delivery.deliver_once(isolated_db, config(), sender, NOW)['idle'] == 1
    assert delivery.deliver_once(isolated_db, config(), sender, NOW + timedelta(seconds=2))['sent'] == 1
    assert len(sender.messages) == 2


def test_paused_digest_allows_settings_replies_but_disabled_bot_never_sends(isolated_db):
    active(isolated_db)
    settings, sender = config(), Sender()
    settings.telegram_delivery_enabled = False
    assert delivery.deliver_once(isolated_db, settings, sender, NOW)['sent'] == 0
    command(isolated_db, '/settings', 3, settings=settings)
    assert delivery.deliver_once(isolated_db, settings, sender, NOW)['sent'] == 1
    assert message('paused', 'pl') in sender.messages[0][1]
    settings.telegram_enabled = False
    assert delivery.deliver_once(isolated_db, settings, sender, NOW + timedelta(seconds=2))['sent'] == 0


def test_retention_clears_old_command_text_and_keeps_active_digest_dedup(isolated_db):
    sub = active(isolated_db)
    delivery.deliver_once(isolated_db, config(), Sender(), NOW)
    command(isolated_db, '/settings', 3)
    subscriptions.cleanup(isolated_db, NOW + timedelta(days=8))
    assert isolated_db.get(TelegramSubscription, sub.id)
    assert list(isolated_db.scalars(select(TelegramUpdate))) == []
    rows = list(isolated_db.scalars(select(TelegramDelivery)))
    assert len(rows) == 1 and rows[0].kind == 'DIGEST' and rows[0].text == ''


def test_lifecycle_logs_never_include_ids_filters_tokens_or_submitted_text(isolated_db, caplog):
    caplog.set_level(logging.INFO)
    settings = config()
    active(isolated_db)
    command(isolated_db, '/set budget=239.12', 3)
    command(isolated_db, '/stop', 4)
    for private in ['900001', '239.12', settings.telegram_bot_token.get_secret_value(),
                    settings.telegram_webhook_secret.get_secret_value(), '/set budget']:
        assert private not in caplog.text
    assert 'Telegram opt-in confirmed' in caplog.text


@pytest.mark.parametrize('changes', [{'telegram_enabled': True},
    {'telegram_delivery_enabled': True}, {'telegram_send_interval_seconds': 0.1}])
def test_unsafe_config_is_rejected_without_echoing_secrets(changes):
    with pytest.raises(ValidationError) as error:
        Settings(_env_file=None, **changes)
    assert 'input_value' not in str(error.value)


class Reply(BytesIO):
    code = 200


def test_tls_transport_is_fixed_host_plain_text_no_paid_broadcast_and_does_not_log_token(monkeypatch, caplog):
    settings, client = config(), TelegramClient(config())
    calls = []

    def send(request, timeout):
        calls.append((request, timeout))
        return Reply(json.dumps({'ok': True, 'result': {'message_id': 1, 'chat': {'id': 900001}}}).encode())

    monkeypatch.setattr(client.opener, 'open', send)
    client.send(900001, 'Synthetic <no HTML>')
    request, timeout = calls[0]
    assert request.full_url.startswith('https://api.telegram.org/bot')
    payload = json.loads(request.data)
    assert payload['allow_paid_broadcast'] is False
    assert 'parse_mode' not in payload and timeout == 5
    assert settings.telegram_bot_token.get_secret_value() not in caplog.text


@pytest.mark.parametrize('result,code,kind', [
    ({'ok': False, 'error_code': 429, 'parameters': {'retry_after': 12}}, 429, 'RATE_LIMITED'),
    ({'ok': False, 'error_code': 403}, 403, 'BLOCKED'),
    ({'ok': False, 'description': 'private-token'}, 500, 'UNCERTAIN'),
    ({'ok': True, 'result': {'message_id': 1, 'chat': {'id': 5}}}, 200, 'UNCERTAIN'),
])
def test_transport_sanitizes_protocol_failures(monkeypatch, result, code, kind):
    client = TelegramClient(config())

    def send(request, timeout):
        if code != 200:
            raise HTTPError(request.full_url, code, 'private-token', {},
                            Reply(json.dumps(result).encode()))
        return Reply(json.dumps(result).encode())

    monkeypatch.setattr(client.opener, 'open', send)
    with pytest.raises(TelegramFailure) as caught:
        client.send(900001, 'Synthetic')
    assert caught.value.kind == kind and 'private-token' not in str(caught.value)


def test_transport_timeout_invalid_json_and_oversize_do_not_retry(monkeypatch):
    client = TelegramClient(config())
    calls = []

    def fail(request, timeout):
        calls.append(True)
        raise URLError('private-token')

    monkeypatch.setattr(client.opener, 'open', fail)
    with pytest.raises(TelegramFailure):
        client.send(900001, 'Synthetic')
    assert len(calls) == 1
    with pytest.raises(TelegramFailure):
        client.send(900001, 'x' * 4097)
    assert len(calls) == 1
    monkeypatch.setattr(client.opener, 'open', lambda *args, **kwargs: Reply(b'not json'))
    with pytest.raises(TelegramFailure):
        client.send(900001, 'Synthetic')


def test_all_bot_copy_has_four_nonempty_translations():
    for values in COPY.values():
        assert len(values) == 4 and all(value.strip() for value in values)
