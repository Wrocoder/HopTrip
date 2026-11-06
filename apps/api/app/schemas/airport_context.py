"""Sourced airport-to-city facts, separate from itinerary and city-time estimates."""
from datetime import date, time
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class AirportCityRecord(BaseModel):
    airport: str = Field(pattern=r"^[A-Z]{3}$")
    destination_slug: str = Field(min_length=1)
    target_city: str = Field(min_length=1)
    distance_km: int = Field(gt=0)
    distance_basis: Literal["PUBLISHER_UNSPECIFIED"] = "PUBLISHER_UNSPECIFIED"
    source: HttpUrl
    last_verified_at: date


class AirportCityContext(BaseModel):
    airport: str | None = None
    destination_slug: str = ""
    target_city: str | None = None
    status: Literal["KNOWN", "STALE", "UNKNOWN"] = "UNKNOWN"
    distance_km: int | None = None
    distance_basis: Literal["PUBLISHER_UNSPECIFIED"] | None = None
    source: HttpUrl | None = None
    last_verified_at: date | None = None
    remote: bool | None = None
    travel_minutes: None = None
    travel_estimate_status: Literal["UNKNOWN"] = "UNKNOWN"


AirportWarning = Literal[
    "UNVERIFIED_ITINERARY", "DIFFERENT_DESTINATION_AIRPORTS", "DIFFERENT_HOME_AIRPORTS",
    "REMOTE_ARRIVAL_AIRPORT", "REMOTE_RETURN_AIRPORT", "ARRIVAL_METADATA_UNKNOWN",
    "RETURN_METADATA_UNKNOWN", "STALE_AIRPORT_METADATA", "LATE_ARRIVAL", "EARLY_ARRIVAL",
    "EARLY_RETURN_DEPARTURE", "ARRIVAL_TIME_UNKNOWN", "RETURN_DEPARTURE_TIME_UNKNOWN",
    "TRANSFER_TIME_UNKNOWN",
]


class AirportContext(BaseModel):
    version: Literal["airport-context-v1"] = "airport-context-v1"
    itinerary_verified: bool = False
    arrival: AirportCityContext = Field(default_factory=AirportCityContext)
    return_departure: AirportCityContext | None = None
    different_destination_airports: bool | None = None
    different_home_airports: bool | None = None
    arrival_local_time: time | None = None
    return_departure_local_time: time | None = None
    arrival_time_estimated: bool = False
    warnings: list[AirportWarning] = Field(default_factory=list)
    # Product warning thresholds, not airport/transport operating hours.
    remote_from_km: Literal[40] = 40
    metadata_max_age_days: Literal[180] = 180
    late_arrival_from: Literal["22:00"] = "22:00"
    early_arrival_before: Literal["06:00"] = "06:00"
    early_return_departure_before: Literal["08:00"] = "08:00"
    limitations: list[str] = Field(default_factory=lambda: [
        "PUBLISHED_DISTANCE_IS_NOT_A_ROUTE_OR_TRAVEL_TIME", "TRANSPORT_SCHEDULE_AND_FARE_UNKNOWN",
    ])
