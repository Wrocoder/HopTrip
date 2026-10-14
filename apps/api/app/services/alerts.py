"""Subscription preferences and double opt-in; digest delivery is a separate task."""

import hashlib
import hmac
import logging
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.config import Settings
from app.models.alert import AlertDelivery, DealAlert
from app.models.location import Destination
from app.schemas.alert import AlertFilters, AlertSignup
from app.services.airports import matching_airports
from app.services.alert_mail import send_alert_mail
from fastapi import HTTPException
from sqlalchemy import delete, func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
CONSENT_VERSION = "personal-alerts-2026-10-12"


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
    frequency = "raz w tygodniu" if alert.filters.get("frequency", "weekly") == "weekly" else "najwyżej raz dziennie"
    body += f"\nCzęstotliwość: {frequency}; tylko weekendy: {'tak' if alert.filters.get('weekend') else 'nie'}."
    body += ("\nPo potwierdzeniu będziemy wysyłać nowe dopasowania według wybranej częstotliwości."
             if settings.alerts_digest_enabled else
             "\nUstawienia są zapisane. Wysyłka podsumowań jest obecnie wstrzymana.")
    body += " Jeśli to nie Ty, zignoruj tę wiadomość.\n"
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
