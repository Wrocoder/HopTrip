from datetime import date, datetime, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

EventCategory = Literal["ALL", "MUSIC", "SPORTS", "CULTURE"]

FitReason = Literal[
    "BEFORE_ARRIVAL", "AFTER_RETURN", "ENDS_AFTER_RETURN", "ARRIVAL_BUFFER", "RETURN_BUFFER",
    "UNKNOWN_EVENT_TIME", "INVALID_EVENT_TIME", "AMBIGUOUS_EVENT_TIME", "UNKNOWN_DURATION",
    "UNKNOWN_ARRIVAL", "UNKNOWN_RETURN", "ONE_WAY", "UNKNOWN_AIRPORT", "UNKNOWN_TIMEZONE", "OUTSIDE_FLIGHT_DATES",
]


class EventFlightFit(BaseModel):
    status: Literal["CONFLICT", "TIGHT", "CHECK", "NO_KNOWN_CONFLICT"]
    reasons: list[FitReason] = Field(default_factory=list)
    buffer_minutes: int = 180
    arrival_gap_minutes: int | None = None
    return_gap_minutes: int | None = None
    return_start_gap_minutes: int | None = None
    duration_minutes: int | None = None
    arrival_airport: str | None = None
    return_airport: str | None = None
    arrival_estimated: bool = False


class EventSession(BaseModel):
    id: str
    start_date: date
    end_date: date | None = None
    local_time: time | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    timezone: str
    status: Literal["onsale", "offsale", "rescheduled"]
    url: str
    price_from: Decimal | None = None
    currency: str | None = None


class EventTicketOption(EventSession):
    name: str
    ticket_kind: Literal["STANDARD", "PREMIUM"]


class EventRead(EventSession):
    name: str
    category: Literal["MUSIC", "SPORTS", "CULTURE", "OTHER"]
    genre: str | None = None
    venue: str
    venue_id: str | None = None
    city: str
    sessions: list[EventSession] = Field(default_factory=list)
    # Options describe one session; different start times remain separate EventRead cards.
    ticket_options: list[EventTicketOption] = Field(default_factory=list)


class EventResults(BaseModel):
    date_mode: Literal["flight", "stay", "other"] = "flight"
    status: Literal["READY", "EMPTY", "UNAVAILABLE", "NEEDS_DATES", "DISABLED", "UNSUPPORTED"]
    events: list[EventRead] = Field(default_factory=list)
    start_date: date | None = None
    end_date: date | None = None
    checked_at: datetime | None = None
    partial: bool = False
    event_date: date | None = None
    page: int = 1
    page_size: int = 12
    total: int = 0
    has_more: bool = False
    # Per-flight results are computed on read, never saved in the shared event catalogue.
    flight_fit: dict[str, EventFlightFit] = Field(default_factory=dict)
