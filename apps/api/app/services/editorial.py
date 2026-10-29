"""Deterministic drafts from our catalogue. No provider calls and no publishing adapter."""
import hashlib
import json
from datetime import UTC, date, datetime, timedelta
from html import escape
from zoneinfo import ZoneInfo

from app.config import get_settings
from app.models.deal import Deal, DealComponent
from app.models.editorial import EditorialAudit, EditorialItem, EditorialRevision
from app.models.event import LocalEvent
from app.models.offer import TravelOffer
from app.providers.ticketmaster import safe_ticket_url
from app.schemas.event import EventRead
from app.services.availability import available_deals_query
from app.services.catalog import serialize_deal
from app.services.price_freshness import price_freshness
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

CHANNELS = ("telegram", "facebook", "instagram", "tiktok", "linkedin")
# These are internal editorial size limits, not claims about platform API limits.
TEXT_LIMIT = 1800
DISCLOSURE = "Linki partnerskie: HopTrip może otrzymać prowizję za zakup."
GUIDES = {
    "baggage": {
        "title": "Bagaż: co naprawdę obejmuje cena biletu",
        "summary": "Przed zakupem porównaj liczbę sztuk, wymiary, wagę i dopłaty za bagaż. "
        "Sprawdź zasady dla każdego pasażera i każdego odcinka podróży.",
        "url": "https://hoptrip.pl/info/baggage",
        "reviewed_at": "2026-09-23", "version": 1,
        "source_file": "apps/web/src/lib/travel-guides.ts#baggage",
    },
}


def now() -> datetime:
    return datetime.now(UTC)


def utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def checksum(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                     default=str).encode()).hexdigest()


def source_snapshot(db: Session, kind: str, source: dict) -> dict:
    checked = now()
    if kind == "guide":
        guide = GUIDES.get(source.get("guide", ""))
        if not guide:
            raise HTTPException(422, "Выберите доступный гайд")
        return {"facts": dict(guide), "checked_at": checked.isoformat(),
                "valid_until": (checked + timedelta(hours=6)).isoformat()}
    deal = db.scalar(available_deals_query(checked).where(Deal.id == source.get("deal_id")))
    if not deal:
        raise HTTPException(409, "Перелёт истёк, скрыт или данные устарели")
    context = serialize_deal(db, deal)
    flights = [c for c in context.components if c.component_type == "FLIGHT" and c.available]
    if not flights or deal.flight_price_pln is None:
        raise HTTPException(409, "Нет доступной партнёрской ссылки или цены перелёта")
    if deal.travelers != 1 or context.price_basis != "FLIGHT_PER_PERSON":
        raise HTTPException(409, "Шаблон рассчитан на цену перелёта для одного пассажира")
    event = db.get(LocalEvent, source.get("event_id"))
    if (not event or not event.active or event.destination_id != deal.destination_id
            or utc(event.checked_at) < checked - timedelta(hours=get_settings().events_max_age_hours)):
        raise HTTPException(409, "Событие скрыто, устарело или относится к другому городу")
    public = EventRead.model_validate(event.payload)
    if public.status != "onsale" or not safe_ticket_url(public.url, get_settings().ticketmaster_affiliate_id):
        raise HTTPException(409, "Билеты события недоступны или ссылка не прошла проверку")
    facts = context.flight_facts
    zone = ZoneInfo(public.timezone or facts.destination_timezone or "UTC")
    arrival = facts.outbound_arrival
    departure = facts.return_departure if context.trip_type == "ROUND_TRIP" else None
    start = arrival.astimezone(zone).date() if arrival else deal.trip_start
    end = departure.astimezone(zone).date() if departure else deal.trip_end
    if context.trip_type == "ONE_WAY":
        try:
            end = date.fromisoformat(source.get("stay_until", ""))
        except ValueError:
            raise HTTPException(422, "Для перелёта в одну сторону укажите конец пребывания") from None
        if not start <= end <= start + timedelta(days=30):
            raise HTTPException(422, "Период пребывания: от даты прилёта до 31 дня")
    if not start <= public.start_date <= end or public.start_date < checked.astimezone(zone).date():
        raise HTTPException(409, "Дата события не входит в период поездки")
    if public.local_time:
        instant = datetime.combine(public.start_date, public.local_time, zone).astimezone(UTC)
        if instant <= checked or (arrival and instant < arrival) or (departure and instant >= departure):
            raise HTTPException(409, "Время события не подходит к расписанию перелёта")
    components = list(db.scalars(select(DealComponent).where(DealComponent.deal_id == deal.id)))
    offer = next((db.get(TravelOffer, c.travel_offer_id) for c in components
                  if c.component_type == "FLIGHT" and c.travel_offer_id), None)
    if offer and offer.price_pln != deal.flight_price_pln:
        raise HTTPException(409, "Цена источника изменилась. Дождитесь обновления предложения")
    observed = utc(offer.source_observed_at or offer.last_verified_at) if offer else utc(deal.last_verified_at)
    price_deadline = price_freshness(deal, offer, checked).hidden_after
    if price_deadline is None:
        raise HTTPException(409, "Неизвестен срок актуальности цены")
    valid_until = min(checked + timedelta(hours=6), price_deadline,
                      utc(event.checked_at) + timedelta(hours=get_settings().events_max_age_hours))
    if deal.expires_at:
        valid_until = min(valid_until, utc(deal.expires_at))
    if offer and offer.expires_at:
        valid_until = min(valid_until, utc(offer.expires_at))
    if valid_until <= checked:
        raise HTTPException(409, "Наблюдение цены устарело")
    # Hash private conditions instead of exposing raw provider metadata in the editor.
    conditions = checksum([{"id": c.id, "price": c.price_pln, "metadata": c.metadata_json,
                            "program": c.affiliate_program_id, "mandatory": c.is_mandatory,
                            "label": c.label} for c in components])
    result = {
        "title": f"{context.origin_city} → {context.destination_city}",
        "url": f"https://hoptrip.pl/deals/{deal.slug}",
        "start": str(start), "end": str(end), "trip_type": context.trip_type,
        "flight_price_pln": str(deal.flight_price_pln),
        "travelers": deal.travelers, "price_basis": context.price_basis,
        "flight_facts": facts.model_dump(mode="json"), "conditions_hash": conditions,
        "original_currency": offer.original_currency if offer else "PLN",
        "original_price": str(offer.original_price) if offer else str(deal.flight_price_pln),
        "offer_conditions_hash": checksum(offer.raw_payload) if offer else None,
        "event": public.model_dump(mode="json"),
    }
    return {"facts": result, "checked_at": checked.isoformat(),
            "price_observed_at": observed.isoformat(),
            "event_checked_at": utc(event.checked_at).isoformat(),
            "valid_until": valid_until.isoformat()}


def draft_text(snapshot: dict, kind: str) -> str:
    facts = snapshot["facts"]
    if kind == "guide":
        return f'{facts["title"]}\n\n{facts["summary"]}'
    event = facts["event"]
    direction = "w obie strony" if facts["trip_type"] == "ROUND_TRIP" else "w jedną stronę"
    price = (f'od {event["price_from"]} {event["currency"]}'
             if event.get("price_from") is not None and event.get("currency") else "sprawdź u sprzedawcy")
    return (f'{facts["title"]} · {facts["start"]}–{facts["end"]}\n\n'
            f'Lot {direction}: zaobserwowano {facts["flight_price_pln"]} PLN/os.\n'
            f'{event["name"]} · {event["start_date"]}\n{event.get("venue") or event.get("city") or ""}\n'
            f'Bilet na wydarzenie: {price}. Kupowany osobno.\n\n'
            'Przed zakupem sprawdź godziny, dojazd, bagaż i końcowe ceny u sprzedawców. '
            'Dopasowanie dat nie gwarantuje czasu na dojazd.')


def render_text(revision: EditorialRevision, channel: str) -> str:
    return revision.artifacts["texts"][channel]


def observed_label(value: str) -> str:
    return datetime.fromisoformat(value).astimezone(ZoneInfo("Europe/Warsaw")).strftime("%d.%m.%Y, %H:%M (Warszawa)")


def render_variant(snapshot: dict, body: str, channel: str) -> str:
    facts = snapshot["facts"]
    link = (f'Szczegóły: {facts["url"]}' if channel not in {"instagram", "tiktok"}
            else f'Sprawdź ofertę na HopTrip. Adres do ręcznego udostępnienia: {facts["url"]}')
    suffix = ""
    if "event" in facts:
        suffix = (f'\nObserwacja ceny: {observed_label(snapshot["price_observed_at"])}. '
                  f'Dane wydarzenia: {observed_label(snapshot["event_checked_at"])}.\n'
                  f'Cena może się zmienić; to nie jest rezerwacja.\n{DISCLOSURE}')
    return f"{body}\n\n{link}{suffix}"


def media_svg(snapshot: dict) -> str:
    facts = snapshot["facts"]
    title = escape(facts["title"][:55])
    subtitle = escape((facts.get("event", {}).get("name") or "Poradnik podróżnika")[:60])
    detail = escape(f'{facts["start"]} · lot od {facts["flight_price_pln"]} PLN/os.'
                    if "event" in facts else "Zaplanuj podróż świadomie")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">'
            '<rect width="1200" height="630" fill="#122b31"/>'
            '<circle cx="1110" cy="30" r="290" fill="#1c4547"/>'
            '<g font-family="Arial,sans-serif" fill="#fff">'
            '<text x="70" y="105" font-size="32" fill="#c6efb4">HopTrip / inspiracje</text>'
            f'<text x="70" y="245" font-size="40">{title}</text>'
            f'<text x="70" y="320" font-size="30">{subtitle}</text>'
            f'<text x="70" y="420" font-size="28" fill="#c6efb4">{detail}</text>'
            '<text x="70" y="555" font-size="22">Sprawdź aktualne warunki na hoptrip.pl</text>'
            '</g></svg>')


def build_artifacts(snapshot: dict, variants: dict) -> dict:
    return {"template": 1, "texts": {c: render_variant(snapshot, variants[c], c) for c in CHANNELS},
            "media_svg": media_svg(snapshot), "media_rights": "HopTrip original template v1"}


def revision_checksum(snapshot: dict, variants: dict) -> str:
    return checksum({"snapshot": snapshot, "variants": variants,
                     "artifacts": build_artifacts(snapshot, variants)})


def audit(db: Session, item: EditorialItem, owner: str, action: str, details=None):
    db.add(EditorialAudit(item_id=item.id, version=item.version, owner=owner,
                          action=action, details=details or {}, created_at=now()))


def check_revision(db: Session, item: EditorialItem, revision: EditorialRevision) -> tuple[dict | None, str | None]:
    if (revision_checksum(revision.snapshot, revision.variants) != revision.checksum
            or checksum({"snapshot": revision.snapshot, "variants": revision.variants,
                         "artifacts": revision.artifacts}) != revision.checksum):
        return None, "Шаблон изменился. Создайте и одобрите новую версию"
    try:
        fresh = source_snapshot(db, item.kind, item.source)
    except HTTPException as exc:
        return None, str(exc.detail)
    if checksum(fresh["facts"]) != checksum(revision.snapshot["facts"]):
        return fresh, "Изменились цена, даты, условия или событие. Создайте новую версию"
    if datetime.fromisoformat(revision.snapshot["valid_until"]) <= now():
        return fresh, "Срок проверки этой версии истёк. Обновите источник и проверьте текст"
    return fresh, None
