"""Scheduled, at-most-once SMTP attempts for confirmed subscriptions."""

import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import quote
from zoneinfo import ZoneInfo

from app.config import Settings
from app.models.alert import AlertDelivery, DealAlert
from app.models.deal import Deal
from app.models.location import Destination
from app.schemas.alert import AlertFilters
from app.services.alert_mail import send_alert_mail
from app.services.alert_matching import candidate_deals
from app.services.alerts import CONSENT_VERSION, alert_link, utc
from app.services.catalog import serialize_deal
from app.services.destination_search import destination_search_fields
from app.services.trip_timeline_text import timeline_text
from pydantic import ValidationError
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

WARSAW = ZoneInfo("Europe/Warsaw")
logger = logging.getLogger(__name__)


def due(settings: Settings, filters: AlertFilters, last: datetime | None, now: datetime) -> bool:
    local = utc(now).astimezone(WARSAW)
    if (local.hour, local.minute) < (settings.alerts_digest_hour, settings.alerts_digest_minute):
        return False
    if filters.frequency == "weekly" and local.weekday() != settings.alerts_digest_weekday:
        return False
    # Calendar frequency: DST days can have 23/25 hours; never twice on a local date.
    interval = 7 if filters.frequency == "weekly" else 1
    return last is None or (local.date() - utc(last).astimezone(WARSAW).date()).days >= interval


def matching_deals(
    db: Session, alert: DealAlert, filters: AlertFilters, now: datetime, *,
    reservation: AlertDelivery | None = None,
) -> list[Deal]:
    history = select(AlertDelivery).where(AlertDelivery.alert_id == alert.id)
    if reservation is not None:
        # Revalidate exactly this reservation without treating itself as a prior send.
        history = history.where(AlertDelivery.id != reservation.id)
    used = {deal_id for delivery in db.scalars(history) for deal_id in delivery.deal_ids}
    return candidate_deals(db, filters, now, excluded=used,
                           included=reservation.deal_ids if reservation else None)


def digest_body(db: Session, settings: Settings, alert: DealAlert, deals: list[Deal]) -> str:
    lines = ["Nowe loty pasujące do Twoich ustawień HopTrip:"]
    for deal in deals:
        view = serialize_deal(db, deal)
        destination = db.get(Destination, deal.destination_id)
        label = (destination_search_fields(db, [destination])[destination.id]["display_name"]
                 if destination else view.destination_city)
        price = f"{deal.price_per_person_pln:.2f}".replace(".", ",")
        observed = utc(deal.last_verified_at).astimezone(WARSAW).strftime("%d.%m.%Y %H:%M %Z")
        facts = view.flight_facts
        stops = (str(facts.outbound_stops) if facts.outbound_stops is not None else "brak danych")
        return_stops = (str(facts.return_stops) if facts.return_stops is not None else "brak danych")
        lines.append(
            f"\n{view.origin_city} ({view.origin_code}) → {label}\n"
            f"{deal.trip_start:%d.%m.%Y} – {deal.trip_end:%d.%m.%Y}; w obie strony.\n"
            f"{timeline_text(facts)}\n"
            f"Zaobserwowana cena lotu: {price} zł/os. Dane odświeżono: {observed}.\n"
            f"Przesiadki: wylot {stops}, powrót {return_stops}. "
            "Bagaż i warunki taryfy: sprawdź u sprzedawcy.\n"
            "Nocleg, transfery i pozostałe koszty nie są ujęte w cenie lotu.\n"
            f"{settings.alerts_site_url.rstrip('/')}/deals/{quote(deal.slug, safe='')}"
        )
    lines.extend([
        "\nCena i dostępność mogą się zmienić. Odświeżenie danych nie potwierdza ceny u sprzedawcy.",
        "Sprawdź godziny lotów przed zakupem; weekend nie gwarantuje wyjazdu bez urlopu.",
        "Linki na stronie mogą być afiliacyjne.",
        "Ustawienia i wypisanie: " + alert_link(settings, alert, "manage"),
    ])
    return "\n".join(lines)


def cleanup(db: Session, now: datetime) -> None:
    # Keep all active delivery history: pruning it could resend a long-lived deal.
    obsolete = select(DealAlert.id).where(
        ((DealAlert.status == "PENDING") & (DealAlert.requested_at < now - timedelta(days=7)))
        | ((DealAlert.status == "STOPPED") & (DealAlert.stopped_at < now - timedelta(days=30)))
    )
    db.execute(delete(AlertDelivery).where(AlertDelivery.alert_id.in_(obsolete)))
    db.execute(delete(DealAlert).where(DealAlert.id.in_(obsolete)))
    db.commit()
    logger.info("Alert retention cleanup completed")


def deliver_digests(db: Session, settings: Settings, now: datetime | None = None) -> dict[str, int]:
    counts = {"sent": 0, "uncertain": 0, "skipped": 0, "cancelled": 0}
    if not settings.alerts_enabled or not settings.alerts_digest_enabled:
        return counts
    # An injected instant freezes tests; a real batch must advance its clock per send.
    def clock() -> datetime:
        return utc(now if now is not None else datetime.now(UTC))

    cleanup(db, clock())
    ids = list(db.scalars(select(DealAlert.id).where(DealAlert.status == "ACTIVE")))
    db.commit()
    for alert_id in ids:
        checked_at = clock()
        # PostgreSQL is the worker runtime; row locks serialize competing workers.
        alert = db.scalar(select(DealAlert).where(DealAlert.id == alert_id)
                          .with_for_update().execution_options(populate_existing=True))
        try:
            filters = AlertFilters.model_validate(alert.filters) if alert else None
        except ValidationError:
            filters = None
        if (alert is None or alert.status != "ACTIVE" or alert.confirmed_at is None
                or alert.consent_version != CONSENT_VERSION
                or filters is None or not due(settings, filters, alert.last_digest_at, checked_at)):
            db.rollback()
            counts["skipped"] += 1
            continue
        deals = matching_deals(db, alert, filters, checked_at)
        if not deals:
            db.rollback()
            counts["skipped"] += 1
            continue
        original_filters = dict(alert.filters)
        delivery = AlertDelivery(alert_id=alert_id, deal_ids=[deal.id for deal in deals],
                                 status="RESERVED", created_at=checked_at)
        db.add(delivery)
        alert.last_digest_at = checked_at
        # At-most-once attempt, including a crash after SMTP accepted the message.
        db.commit()
        alert = db.scalar(select(DealAlert).where(DealAlert.id == alert_id)
                          .with_for_update().execution_options(populate_existing=True))
        if (alert is None or alert.status != "ACTIVE" or alert.confirmed_at is None
                or alert.consent_version != CONSENT_VERSION or alert.filters != original_filters):
            delivery.status = "CANCELLED"
            counts["cancelled"] += 1
            db.commit()
            logger.info("Alert digest cancelled: subscription changed")
            continue
        # Data may expire, be hidden, change price or lose itinerary evidence while
        # the reservation is committed. Fail closed; do not fill it with other deals.
        deals = matching_deals(db, alert, filters, clock(), reservation=delivery)
        if {deal.id for deal in deals} != set(delivery.deal_ids):
            delivery.status = "CANCELLED"
            counts["cancelled"] += 1
            db.commit()
            logger.info("Alert digest cancelled: matches changed")
            continue
        body = digest_body(db, settings, alert, deals)
        try:
            send_alert_mail(settings, alert.email, "Twoja lista lotów — HopTrip", body)
            delivery.status = "SENT"
            counts["sent"] += 1
            logger.info("Alert digest submitted")
        except Exception:
            delivery.status = "UNCERTAIN"
            counts["uncertain"] += 1
            logger.warning("Digest delivery uncertain; automatic retry suppressed")
        db.commit()
    return counts
