from datetime import date, datetime, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

EventCategory = Literal["ALL", "MUSIC", "SPORTS", "CULTURE"]


class EventSession(BaseModel):
    id: str
    start_date: date
    end_date: date | None = None
    local_time: time | None = None
    timezone: str
    status: Literal["onsale", "offsale", "rescheduled"]
    url: str
    price_from: Decimal | None = None
    currency: str | None = None


class EventRead(EventSession):
    name: str
    category: Literal["MUSIC", "SPORTS", "CULTURE", "OTHER"]
    genre: str | None = None
    venue: str
    venue_id: str | None = None
    city: str
    sessions: list[EventSession] = Field(default_factory=list)


class EventResults(BaseModel):
    status: Literal["READY", "EMPTY", "UNAVAILABLE", "NEEDS_DATES", "DISABLED", "UNSUPPORTED"]
    events: list[EventRead] = Field(default_factory=list)
    start_date: date | None = None
    end_date: date | None = None
    checked_at: datetime | None = None
    partial: bool = False
