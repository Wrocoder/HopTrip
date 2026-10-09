"""Resolve public airport input consistently, without guessing ambiguous cities."""

import unicodedata

from app.models.location import Airport
from sqlalchemy import select
from sqlalchemy.orm import Session

# City aliases also feed the public suggestions, so the browser and API agree.
AIRPORT_ALIASES: dict[str, tuple[str, ...]] = {
    "WRO": ("Wrocław", "Wroclaw"),
    "WAW": ("Warszawa", "Warsaw"),
    "WMI": ("Warszawa", "Warsaw", "Modlin", "Nowy Dwór Mazowiecki"),
    "KRK": ("Kraków", "Krakow", "Cracow"),
    "GDN": ("Gdańsk", "Gdansk"),
    "KTW": ("Katowice", "Pyrzowice"),
    "POZ": ("Poznań", "Poznan"),
    "RZE": ("Rzeszów", "Rzeszow"),
    "SZZ": ("Szczecin", "Goleniów"),
    "LUZ": ("Lublin",),
    "BZG": ("Bydgoszcz",),
    "LCJ": ("Łódź", "Lodz"),
    "SZY": ("Olsztyn", "Szymany"),
    "RDO": ("Radom",),
    "IEG": ("Zielona Góra", "Zielona Gora", "Babimost"),
}


def normalize_airport_input(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.strip().lower().replace("ł", "l"))
    return " ".join("".join(c for c in text if not unicodedata.combining(c)).split())


def matching_airports(db: Session, value: str) -> list[Airport]:
    normalized = normalize_airport_input(value)
    if not normalized:
        return []
    airports = list(db.scalars(select(Airport).where(Airport.is_active.is_(True))))
    # Codes are unambiguous even if a city's name happens to match another code.
    by_code = [a for a in airports if normalize_airport_input(a.iata_code) == normalized]
    if by_code:
        return by_code
    return [
        a for a in airports
        if normalized in {
            normalize_airport_input(term)
            for term in (
                a.city, a.name, f"{a.city} — {a.iata_code}",
                *AIRPORT_ALIASES.get(a.iata_code, ()),
            )
        }
    ]
