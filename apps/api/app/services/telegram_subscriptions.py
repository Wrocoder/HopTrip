"""Authenticated private-chat commands. Webhook processing only queues requested replies."""

import logging
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.config import Settings
from app.models.telegram import TelegramDelivery, TelegramSubscription, TelegramUpdate
from app.schemas.telegram import TelegramFilters
from app.services.alerts import normalized_filters, utc
from app.services.telegram_text import locale_for, message
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import delete, func, select, text, update
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
CONSENT_VERSION = 'telegram-personal-2026-11-02'


def lock(db: Session) -> None:
    # Same transaction lock for commands and delivery across PostgreSQL workers.
    if db.get_bind().dialect.name == 'postgresql':
        db.execute(text('SELECT pg_advisory_xact_lock(574930201)'))


def summary(filters: dict, locale: str) -> str:
    return message('settings', locale) + ':\n' + '\n'.join(
        f'{key}={str(value).lower() if isinstance(value, bool) else value}'
        for key, value in filters.items() if value is not None
    )


def preferences(db: Session, arguments: list[str], previous: dict | None = None) -> dict:
    values: dict = dict(previous or {})
    keys = set()
    if not arguments:
        raise ValueError('Missing preferences')
    for argument in arguments:
        key, separator, value = argument.partition('=')
        if not separator or key in keys or key not in TelegramFilters.model_fields:
            raise ValueError('Invalid preferences')
        keys.add(key)
        values[key] = None if value == 'anywhere' and key == 'destination' else value
    return normalized_filters(db, TelegramFilters.model_validate(values))


def cancel_queued(db: Session, chat_id: int) -> None:
    db.execute(update(TelegramDelivery).where(
        TelegramDelivery.chat_id == chat_id,
        TelegramDelivery.status.in_(['READY', 'RETRY']),
    ).values(status='CANCELLED', text=''))


def receive_update(db: Session, settings: Settings, payload: dict, now: datetime | None = None) -> None:
    now = utc(now or datetime.now(UTC))
    item, update_id = payload.get('message'), payload.get('update_id')
    if not isinstance(item, dict) or type(update_id) is not int or not 0 <= update_id < 2**63:
        return
    chat, sender, sent_at = item.get('chat'), item.get('from'), item.get('date')
    if not isinstance(chat, dict) or not isinstance(sender, dict):
        return
    chat_id, user_id = chat.get('id'), sender.get('id')
    content = item.get('text')
    if (chat.get('type') != 'private' or type(chat_id) is not int
            or type(user_id) is not int or not 0 < chat_id == user_id < 2**52
            or sender.get('is_bot') is not False or type(sent_at) is not int
            or not now.timestamp() - 86400 <= sent_at <= now.timestamp() + 300
            or not isinstance(content, str) or not content.startswith('/') or len(content) > 2000):
        return
    parts = content.split()
    command, _, addressed_bot = parts[0].lower().partition('@')
    if addressed_bot and addressed_bot != settings.telegram_bot_username.lower():
        return
    locale = locale_for(sender.get('language_code'))
    lock(db)
    receipt = db.get(TelegramUpdate, update_id)
    if receipt:
        if now - utc(receipt.received_at) < timedelta(days=7):
            db.rollback()
            return
        # Telegram may randomize update_id after a week without updates.
        # A fresh message may reuse an old receipt ID; its 24h timestamp was checked above.
        db.delete(receipt)
        db.flush()
    previous_at = db.scalar(select(func.max(TelegramUpdate.received_at)).where(
        TelegramUpdate.chat_id == chat_id,
    ))
    sub = db.scalar(select(TelegramSubscription).where(
        TelegramSubscription.chat_id == chat_id,
    ).execution_options(populate_existing=True))
    db.add(TelegramUpdate(update_id=update_id, chat_id=chat_id, received_at=now))
    if (sub and update_id <= sub.last_update_id and previous_at
            and now - utc(previous_at) < timedelta(days=7)):
        db.commit()
        return
    if sub:
        sub.last_update_id = update_id
    db.flush()
    recent = db.scalar(select(func.count()).select_from(TelegramUpdate).where(
        TelegramUpdate.chat_id == chat_id, TelegramUpdate.received_at > now - timedelta(minutes=1),
    )) or 0
    # /stop always changes state, even after the command allowance is exhausted.
    if recent > settings.telegram_commands_per_minute and command != '/stop':
        db.commit()
        logger.info('Telegram command rate limited')
        return
    reply = message('invalid', locale)
    try:
        if command in {'/start', '/help'} and len(parts) == 1:
            reply = message('help', locale)
        elif command == '/subscribe':
            if sub and sub.status == 'ACTIVE':
                reply = message('active', locale) + '\n' + summary(sub.filters, locale)
            else:
                filters = preferences(db, parts[1:])
                if sub is None:
                    sub = TelegramSubscription(id=uuid4().hex, chat_id=chat_id, user_id=user_id,
                                               last_update_id=update_id)
                    db.add(sub)
                sub.status, sub.filters, sub.locale = 'PENDING', filters, locale
                sub.updated_at, sub.opted_in_at, sub.stopped_at = now, None, None
                sub.consent_version = None
                reply = summary(filters, locale) + '\n' + message('confirm', locale)
                logger.info('Telegram preferences pending confirmation')
        elif command == '/confirm' and len(parts) == 1:
            if sub and sub.status == 'PENDING' and now - utc(sub.updated_at) <= timedelta(hours=24):
                sub.status, sub.opted_in_at, sub.consent_version = 'ACTIVE', now, CONSENT_VERSION
                reply = message('active', locale)
                logger.info('Telegram opt-in confirmed')
            elif sub and sub.status == 'ACTIVE':
                reply = message('active', locale)
            else:
                reply = message('expired' if sub and sub.status == 'PENDING' else 'none', locale)
        elif command == '/settings' and len(parts) == 1:
            reply = summary(sub.filters, locale) if sub else message('none', locale)
            if sub:
                reply += '\n' + message('active' if sub.status == 'ACTIVE' else
                                        'confirm' if sub.status == 'PENDING' else 'stopped', locale)
        elif command == '/set':
            if not sub or sub.status != 'ACTIVE':
                reply = message('none', locale)
            else:
                sub.filters = preferences(db, parts[1:], sub.filters)
                sub.updated_at, sub.locale = now, locale
                reply = message('updated', locale) + '\n' + summary(sub.filters, locale)
                logger.info('Telegram preferences updated')
        elif command == '/stop' and len(parts) == 1:
            cancel_queued(db, chat_id)
            if sub and sub.status != 'STOPPED':
                sub.status, sub.stopped_at = 'STOPPED', now
                logger.info('Telegram subscription stopped')
            if recent > settings.telegram_commands_per_minute:
                db.commit()
                return
            reply = message('stopped', locale)
    except (ValueError, ValidationError, HTTPException):
        reply = message('invalid', locale)
    if not settings.telegram_delivery_enabled:
        reply += '\n' + message('paused', locale)
    reply += '\n' + message('privacy', locale) + ': ' + settings.telegram_site_url.rstrip('/') + '/info/privacy'
    # These mappers have no ORM relationship: persist the new parent before its outbox FK.
    # Both writes still commit atomically under the command transaction lock.
    db.flush()
    pending = db.scalar(select(func.count()).select_from(TelegramDelivery).where(
        TelegramDelivery.chat_id == chat_id, TelegramDelivery.status.in_(['READY', 'RETRY']),
    )) or 0
    if pending < 10:
        db.add(TelegramDelivery(subscription_id=sub.id if sub else None, chat_id=chat_id,
                                kind='REPLY', status='READY', deal_ids=[], filters=None,
                                text=reply, created_at=now, due_at=now, attempts=0))
    db.commit()


def cleanup(db: Session, now: datetime) -> None:
    lock(db)
    obsolete = select(TelegramSubscription.id).where(
        ((TelegramSubscription.status == 'PENDING') &
         (TelegramSubscription.updated_at < now - timedelta(days=7))) |
        ((TelegramSubscription.status == 'STOPPED') &
         (TelegramSubscription.stopped_at < now - timedelta(days=30)))
    )
    db.execute(delete(TelegramDelivery).where(TelegramDelivery.subscription_id.in_(obsolete)))
    db.execute(delete(TelegramSubscription).where(TelegramSubscription.id.in_(obsolete)))
    db.execute(delete(TelegramUpdate).where(TelegramUpdate.received_at < now - timedelta(days=7)))
    db.execute(delete(TelegramDelivery).where(
        TelegramDelivery.kind == 'REPLY', TelegramDelivery.created_at < now - timedelta(days=7),
    ))
    db.commit()
    logger.info('Telegram retention cleanup completed')
