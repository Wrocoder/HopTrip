"""Double opt-in and conservative, at-most-once daily email delivery."""

import hashlib
import hmac
import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import quote
from uuid import uuid4

from app.config import Settings
from app.models.alert import AlertDelivery, DealAlert
from app.models.deal import Deal
from app.models.location import Destination
from app.schemas.alert import AlertFilters, AlertSignup
from app.services.airports import matching_airports
from app.services.alert_mail import send_alert_mail
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from fastapi import HTTPException
from sqlalchemy import delete, func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
CONSENT_VERSION = "daily-alerts-2026-10-08"


def utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def capability(settings: Settings, alert: DealAlert, purpose: str) -> str:
    timestamp = str(int(utc(alert.requested_at).timestamp())) if purpose == "confirm" else "manage"
    payload = f"{alert.id}.{timestamp}"
    signature = hmac.new(settings.alerts_signing_key.get_secret_value().encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"


def authorized(db: Session, settings: Settings, token: str, purpose: str) -> DealAlert:
    alert = db.scalar(select(DealAlert).where(DealAlert.id == token.split(".")[0]).with_for_update())
    if (not settings.alerts_signing_key.get_secret_value() or alert is None
            or not hmac.compare_digest(token, capability(settings, alert, purpose))):
        raise HTTPException(404, "Invalid alert link")
    return alert


def normalized_filters(db: Session, value: AlertFilters) -> dict:
    airports = matching_airports(db, value.origin)
    if len(airports) != 1:
        raise HTTPException(422, "Select a departure airport")
    if value.destination and not db.scalar(select(Destination).where(
        Destination.slug == value.destination, Destination.is_active.is_(True)
    )):
        raise HTTPException(422, "Unknown destination")
    if value.departure_to and value.departure_to < datetime.now(UTC).date():
        raise HTTPException(422, "Departure range has ended")
    return value.model_copy(update={"origin": airports[0].iata_code}).model_dump(mode="json")


def alert_link(settings: Settings, alert: DealAlert, purpose: str) -> str:
    return f"{settings.alerts_site_url.rstrip('/')}/alerts/{purpose}#token={capability(settings, alert, purpose)}"


def signup(db: Session, settings: Settings, value: AlertSignup) -> None:
    if not settings.alerts_enabled:
        raise HTTPException(503, "Alerts are not available")
    filters = normalized_filters(db, value.filters)
    now = datetime.now(UTC)
    if db.get_bind().dialect.name == "postgresql":
        # Serialize the daily signup cap across API processes; released by commit/rollback.
        db.execute(text("SELECT pg_advisory_xact_lock(486720914)"))
    alert = db.scalar(select(DealAlert).where(DealAlert.email == value.email).with_for_update())
    # An anonymous request must never edit or cancel an existing confirmed subscription.
    if alert and now - utc(alert.requested_at) < timedelta(days=1):
        return
    count = db.scalar(select(func.count()).select_from(DealAlert).where(
        DealAlert.requested_at > now - timedelta(days=1)
    )) or 0
    if count >= settings.alerts_daily_signup_limit:
        raise HTTPException(429, "Please try again later")
    if alert and alert.status == "STOPPED":
        db.execute(delete(AlertDelivery).where(AlertDelivery.alert_id == alert.id))
        db.delete(alert)
        db.flush()
        alert = None
    if alert is None:
        alert = DealAlert(id=uuid4().hex, email=value.email, filters=filters, status="PENDING",
                          consent_version=CONSENT_VERSION, requested_at=now)
        db.add(alert)
    else:
        alert.requested_at = now
    try:
        db.commit()
    except IntegrityError:
        db.rollback()  # Concurrent signup for the same email: keep the same generic response.
        return
    purpose = "manage" if alert.status == "ACTIVE" else "confirm"
    body = ("Zarządzaj swoim alertem HopTrip:\n" if purpose == "manage" else
            "Potwierdź alert HopTrip (link ważny przez 48 godzin). Bez potwierdzenia nie wyślemy ofert.\n")
    body += alert_link(settings, alert, purpose)
    body += (f"\n\nLotnisko: {alert.filters['origin']}; limit: {alert.filters['budget']} PLN/os.; "
             f"pobyt: {alert.filters['duration_min']}–{alert.filters['duration_max']} nocy."
             f"\nKierunek: {alert.filters.get('destination') or 'dowolny'}; "
             f"wylot od: {alert.filters.get('departure_from') or 'dowolny'}; "
             f"do: {alert.filters.get('departure_to') or 'dowolny'}.")
    body += "\n\nMaksymalnie jedna wiadomość z nowymi pasującymi lotami na 24 godziny. Jeśli to nie Ty, zignoruj tę wiadomość.\n"
    body += "Wypisanie i ustawienia: " + alert_link(settings, alert, "manage")
    try:
        send_alert_mail(settings, alert.email, "Twój alert lotniczy HopTrip", body)
    except Exception:
        # Never log SMTP exceptions: providers may include the recipient or credentials.
        logger.warning("Alert confirmation delivery failed")
        raise HTTPException(503, "Email delivery unavailable; try again tomorrow") from None


def confirm(db: Session, settings: Settings, token: str) -> str:
    alert = authorized(db, settings, token, "confirm")
    if alert.status == "STOPPED" or datetime.now(UTC) - utc(alert.requested_at) > timedelta(hours=48):
        raise HTTPException(410, "Confirmation link expired")
    if alert.status == "PENDING":
        alert.status = "ACTIVE"
        alert.confirmed_at = datetime.now(UTC)
        db.commit()
    return capability(settings, alert, "manage")


def cleanup(db: Session, now: datetime) -> None:
    obsolete = select(DealAlert.id).where(
        ((DealAlert.status == "PENDING") & (DealAlert.requested_at < now - timedelta(days=7)))
        | ((DealAlert.status == "STOPPED") & (DealAlert.stopped_at < now - timedelta(days=30)))
    )
    db.execute(delete(AlertDelivery).where(AlertDelivery.alert_id.in_(obsolete)))
    db.execute(delete(DealAlert).where(DealAlert.id.in_(obsolete)))
    db.execute(delete(AlertDelivery).where(AlertDelivery.created_at < now - timedelta(days=90)))
    db.commit()


def deliver_digests(db: Session, settings: Settings, now: datetime | None = None) -> dict:
    now = now or datetime.now(UTC)
    cleanup(db, now)
    counts = {"sent": 0, "uncertain": 0, "skipped": 0}
    if not settings.alerts_enabled:
        return counts
    ids = list(db.scalars(select(DealAlert.id).where(DealAlert.status == "ACTIVE")))
    db.commit()
    for alert_id in ids:
        alert = db.scalar(select(DealAlert).where(DealAlert.id == alert_id).with_for_update())
        if (alert is None or alert.status != "ACTIVE"
                or (alert.last_digest_at and now - utc(alert.last_digest_at) < timedelta(days=1))):
            db.rollback()
            continue
        filters = AlertFilters.model_validate(alert.filters)
        airports = matching_airports(db, filters.origin)
        if len(airports) != 1:
            db.rollback()
            continue
        query = available_deals_query(now).where(
            Deal.origin_airport_id == airports[0].id,
            Deal.price_per_person_pln <= filters.budget,
            Deal.nights >= filters.duration_min, Deal.nights <= filters.duration_max,
        )
        if filters.destination:
            query = query.join(Destination).where(Destination.slug == filters.destination)
        if filters.departure_from:
            query = query.where(Deal.trip_start >= filters.departure_from)
        if filters.departure_to:
            query = query.where(Deal.trip_start <= filters.departure_to)
        used = {deal_id for batch in db.scalars(select(AlertDelivery).where(
            AlertDelivery.alert_id == alert_id
        )) for deal_id in batch.deal_ids}
        if used:
            query = query.where(Deal.id.not_in(used))
        deals = list(db.scalars(query.order_by(Deal.price_per_person_pln, Deal.id).limit(10)))
        if not deals:
            counts["skipped"] += 1
            db.rollback()
            continue
        lines = ["Nowe loty pasujące do Twojego alertu:"]
        for deal in deals:
            destination = db.get(Destination, deal.destination_id)
            view = serialize_deal(db, deal)
            trip = (f"{deal.trip_start} – {deal.trip_end}, {deal.nights} nocy, w obie strony"
                    if view.trip_type == "ROUND_TRIP" else f"{deal.trip_start}, w jedną stronę")
            lines.append(f"\n{airports[0].city} → {destination.city if destination else ''}: "
                         f"{trip}, "
                         f"{deal.price_per_person_pln} PLN/os.\n"
                         f"{settings.alerts_site_url.rstrip('/')}/deals/{quote(deal.slug, safe='')}")
        lines.extend(["\nCena i dostępność mogą się zmienić. Sprawdź aktualną ofertę przed zakupem.",
                      "Ustawienia i wypisanie: " + alert_link(settings, alert, "manage")])
        body = "\n".join(lines)
        delivery = AlertDelivery(alert_id=alert_id, deal_ids=[d.id for d in deals],
                                 status="RESERVED", created_at=now)
        db.add(delivery)
        alert.last_digest_at = now
        # Persist reservation BEFORE contacting SMTP. A crashed/ambiguous attempt is never resent.
        db.commit()
        alert = db.scalar(select(DealAlert).where(DealAlert.id == alert_id).with_for_update())
        if alert is None or alert.status != "ACTIVE":
            delivery.status = "CANCELLED"
            db.commit()
            continue
        try:
            send_alert_mail(settings, alert.email, "Nowe loty w Twoim budżecie — HopTrip", body)
            delivery.status = "SENT"
            counts["sent"] += 1
        except Exception:
            delivery.status = "UNCERTAIN"
            counts["uncertain"] += 1
            logger.warning("Digest delivery uncertain; automatic retry suppressed")
        db.commit()
    return counts
