"""Additive assessment contract; does not redefine the legacy weekend query."""
from datetime import date, time
from typing import Literal

from pydantic import BaseModel, Field, model_validator

Eligibility = Literal["ELIGIBLE", "INELIGIBLE", "UNKNOWN"]
WeekendMode = Literal["calendar-v1", "flexible-v1", "no-leave-v1"]


class WorkHours(BaseModel):
    start: time = time(9)
    end: time = time(17)

    @model_validator(mode="after")
    def valid_hours(self) -> "WorkHours":
        if (self.start.tzinfo is not None or self.end.tzinfo is not None
                or self.start >= self.end):
            raise ValueError("Work hours must be an increasing local daytime interval")
        return self


class WeekendAssessment(BaseModel):
    version: Literal["weekend-v1"] = "weekend-v1"
    work_hours: WorkHours = Field(default_factory=WorkHours)
    work_timezone: str | None = None
    actual_return_local_date: date | None = None
    airport_arrival_day_offset: int | None = None
    confidence: Literal["KNOWN", "ESTIMATED", "UNKNOWN"] = "UNKNOWN"
    calendar: Eligibility = "UNKNOWN"
    flexible: Eligibility = "UNKNOWN"
    no_leave: Eligibility = "UNKNOWN"
    might_require_leave: bool | None = None
    # This evaluates airport times only, never a door-to-door guarantee.
    airport_times_only: Literal[True] = True
    reasons: list[str] = Field(default_factory=list)
