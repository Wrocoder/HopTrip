"""Email and Telegram share the validated API timeline; no delivery side effects."""
from app.schemas.deal import FlightFacts

COPY = {
    "pl": ("Noce na miejscu", "do potwierdzenia", "Przylot do", "Dzień i godzina przylotu powrotnego do potwierdzenia.", "szac.", "dni"),
    "en": ("Nights at destination", "to be confirmed", "Arrival at", "Return arrival day and time need confirmation.", "estimated", "days"),
    "ru": ("Ночей на месте", "нужно уточнить", "Прилёт в", "День и время обратного прилёта нужно уточнить.", "расчётно", "дн."),
    "uk": ("Ночей на місці", "потрібно уточнити", "Приліт до", "День і час зворотного прильоту потрібно уточнити.", "розрахунково", "дн."),
}


def timeline_text(facts: FlightFacts, locale: str = "pl") -> str:
    nights, unknown, arrival, return_unknown, estimated, days = COPY.get(locale, COPY["pl"])
    timeline = facts.timeline
    count = timeline.nights_at_destination
    stay = f"{nights}: {count if count is not None else unknown}"
    if count is not None and timeline.nights_estimated:
        stay += f" ({estimated})"
    if timeline.local_return_arrival_date is None or not facts.return_destination_airport:
        return stay + ". " + return_unknown
    home = f"{arrival} {facts.return_destination_airport}: {timeline.local_return_arrival_date}"
    offset = timeline.return_arrival_day_offset
    if offset:
        home += f" ({offset:+d} {days})"
    if timeline.return_arrival_estimated:
        home += f" · {estimated}"
    return stay + ". " + home
