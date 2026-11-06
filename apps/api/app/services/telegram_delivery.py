"""Durable Telegram outbox. No network in the webhook; one bounded attempt per tick."""

import logging
from datetime import UTC, datetime, timedelta
from typing import Protocol
from urllib.parse import quote

from app.config import Settings
from app.models.deal import Deal
from app.models.telegram import TelegramDelivery, TelegramSubscription
from app.schemas.telegram import TelegramFilters
from app.services.alert_digests import due
from app.services.alert_matching import candidate_deals
from app.services.alerts import utc
from app.services.catalog import serialize_deal
from app.services.telegram_subscriptions import CONSENT_VERSION, cancel_queued, lock
from app.services.telegram_text import message
from app.services.telegram_transport import TelegramClient, TelegramFailure
from app.services.trip_timeline_text import timeline_text
from pydantic import ValidationError
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class Sender(Protocol):
    def send(self, chat_id: int, text: str) -> None: ...


def matches(
    db: Session, sub: TelegramSubscription, filters: TelegramFilters, now: datetime,
    reservation: TelegramDelivery | None = None,
) -> list[Deal]:
    query = select(TelegramDelivery).where(
        TelegramDelivery.subscription_id == sub.id, TelegramDelivery.kind == 'DIGEST',
    )
    if reservation:
        query = query.where(TelegramDelivery.id != reservation.id)
    used = {deal_id for item in db.scalars(query) for deal_id in item.deal_ids}
    return candidate_deals(db, filters, now, excluded=used,
                           included=reservation.deal_ids if reservation else None,
                           max_connections=filters.max_connections)


def body(db: Session, settings: Settings, sub: TelegramSubscription, deals: list[Deal]) -> str:
    locale = sub.locale
    lines = [message('header', locale)]
    for deal in deals:
        view = serialize_deal(db, deal)
        facts = view.flight_facts
        stops = '/'.join(str(v) if v is not None else message('unknown', locale)
                         for v in (facts.outbound_stops, facts.return_stops))
        lines.append(
            f'\n{view.origin_code} → {view.destination_city[:60]}\n'
            f'{deal.trip_start} – {deal.trip_end}\n'
            f'{timeline_text(facts, locale)}\n'
            f'{message("price", locale)}: {deal.price_per_person_pln:.2f} PLN\n'
            f'{message("seen", locale)}: {utc(deal.last_verified_at):%Y-%m-%d %H:%M UTC}\n'
            f'{message("connections", locale)}: {stops}\n'
            f'{settings.telegram_site_url.rstrip("/")}/deals/{quote(deal.slug, safe="")}'
        )
    lines.append('\n' + message('disclaimer', locale))
    return '\n'.join(lines)


def deliver_once(
    db: Session, settings: Settings, client: Sender | None = None, now: datetime | None = None,
) -> dict[str, int]:
    counts = dict(sent=0, uncertain=0, cancelled=0, blocked=0, rate_limited=0, idle=0)
    if not settings.telegram_enabled:
        return counts

    def clock() -> datetime:
        return utc(now if now is not None else datetime.now(UTC))

    lock(db)
    checked_at = clock()
    latest = db.scalar(select(func.max(TelegramDelivery.attempted_at)))
    cooldown = db.scalar(select(func.max(TelegramDelivery.due_at)).where(
        TelegramDelivery.attempted_at.is_not(None), TelegramDelivery.due_at > checked_at,
    ))
    if ((latest and checked_at < utc(latest) + timedelta(
            seconds=settings.telegram_send_interval_seconds))
            or (cooldown and checked_at < utc(cooldown))):
        db.rollback()
        counts['idle'] += 1
        return counts
    query = select(TelegramDelivery).where(
        TelegramDelivery.status.in_(['READY', 'RETRY']), TelegramDelivery.due_at <= checked_at,
    )
    if not settings.telegram_delivery_enabled:
        query = query.where(TelegramDelivery.kind == 'REPLY')
    delivery = db.scalar(query.order_by(
        case((TelegramDelivery.kind == 'REPLY', 0), else_=1), TelegramDelivery.id,
    ).limit(1).execution_options(populate_existing=True))
    if delivery is None and settings.telegram_delivery_enabled:
        for candidate in db.scalars(select(TelegramSubscription).where(
            TelegramSubscription.status == 'ACTIVE', TelegramSubscription.opted_in_at.is_not(None),
            TelegramSubscription.consent_version == CONSENT_VERSION,
        ).order_by(TelegramSubscription.id).execution_options(populate_existing=True)):
            try:
                filters = TelegramFilters.model_validate(candidate.filters)
            except ValidationError:
                continue
            if not due(settings, filters, candidate.last_digest_at, checked_at):
                continue
            deals = matches(db, candidate, filters, checked_at)
            if not deals:
                continue
            delivery = TelegramDelivery(subscription_id=candidate.id, chat_id=candidate.chat_id,
                                        kind='DIGEST',
                                        status='READY', deal_ids=[d.id for d in deals],
                                        filters=dict(candidate.filters), text='', created_at=checked_at,
                                        due_at=checked_at, attempts=0)
            db.add(delivery)
            candidate.last_digest_at = checked_at
            break
    if delivery is None:
        db.rollback()
        counts['idle'] += 1
        return counts
    delivery.status, delivery.attempted_at = 'RESERVED', checked_at
    delivery.attempts += 1
    # Persist before any possible API submission. RESERVED is never replayed on restart.
    db.commit()
    lock(db)
    if delivery.kind == 'DIGEST':
        sub = db.scalar(select(TelegramSubscription).where(
            TelegramSubscription.id == delivery.subscription_id,
        ).execution_options(populate_existing=True))
        if (not settings.telegram_delivery_enabled or sub is None or sub.status != 'ACTIVE'
                or sub.opted_in_at is None or sub.consent_version != CONSENT_VERSION
                or sub.chat_id != delivery.chat_id or sub.filters != delivery.filters):
            delivery.status, delivery.text = 'CANCELLED', ''
            db.commit()
            counts['cancelled'] += 1
            logger.info('Telegram digest cancelled: subscription changed')
            return counts
        filters = TelegramFilters.model_validate(sub.filters)
        deals = matches(db, sub, filters, clock(), delivery)
        if {d.id for d in deals} != set(delivery.deal_ids):
            delivery.status, delivery.text = 'CANCELLED', ''
            db.commit()
            counts['cancelled'] += 1
            logger.info('Telegram digest cancelled: matches changed')
            return counts
        outgoing = body(db, settings, sub, deals)
    else:
        outgoing = delivery.text
    try:
        (client if client is not None else TelegramClient(settings)).send(delivery.chat_id, outgoing)
        delivery.status, delivery.text = 'SENT', ''
        counts['sent'] += 1
        logger.info('Telegram message submitted')
    except TelegramFailure as failure:
        if failure.kind == 'RATE_LIMITED':
            # A documented 429 is a known rejection; honor its global cooldown.
            delivery.due_at = clock() + timedelta(seconds=failure.retry_after)
            delivery.status = 'RETRY' if delivery.attempts < 3 else 'CANCELLED'
            counts['rate_limited'] += 1
        elif failure.kind == 'BLOCKED':
            sub = db.scalar(select(TelegramSubscription).where(
                TelegramSubscription.chat_id == delivery.chat_id,
            ).execution_options(populate_existing=True))
            if sub:
                sub.status, sub.stopped_at = 'STOPPED', clock()
            cancel_queued(db, delivery.chat_id)
            delivery.status, delivery.text = 'CANCELLED', ''
            counts['blocked'] += 1
        else:
            delivery.status, delivery.text = 'UNCERTAIN', ''
            counts['uncertain'] += 1
        logger.warning('Telegram submission failed; inspect aggregate delivery statuses')
    except Exception:
        # A timeout can follow acceptance; never log exception text or retry blindly.
        delivery.status, delivery.text = 'UNCERTAIN', ''
        counts['uncertain'] += 1
        logger.warning('Telegram submission uncertain; automatic retry suppressed')
    delivery.attempted_at = clock()
    if delivery.status == 'CANCELLED':
        delivery.text = ''
    db.commit()
    return counts
