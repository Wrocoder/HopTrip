"""Airport interval is not a claim about usable time in a city."""
from typing import Literal

from pydantic import BaseModel, Field, computed_field


class DestinationTime(BaseModel):
    version: Literal["destination-time-v1"] = "destination-time-v1"
    scope: Literal["AIRPORT_ARRIVAL_TO_RETURN_DEPARTURE"] = "AIRPORT_ARRIVAL_TO_RETURN_DEPARTURE"
    status: Literal["KNOWN", "ESTIMATED", "UNKNOWN"] = "UNKNOWN"
    airport_interval_minutes: int | None = Field(default=None, ge=0)
    arrival_airport: str | None = None
    departure_airport: str | None = None
    airport_change: bool | None = None
    reason: Literal["UNVERIFIED_ITINERARY", "MISSING_AIRPORTS", "MISSING_OR_INVALID_TIMES", "UNKNOWN_TIMEZONE"] | None = None
    # v1 has no verified transfer/buffer model. Never substitute the airport interval.
    usable_city_minutes: None = None
    city_time_status: Literal["UNKNOWN"] = "UNKNOWN"
    buffers_applied: Literal[False] = False

    @computed_field  # type: ignore[prop-decorator]
    @property
    def sort_eligible(self) -> bool:
        """Reliable airport interval only, not an overall convenience recommendation."""
        return (self.status == "KNOWN" and self.airport_interval_minutes is not None
                and self.arrival_airport is not None and self.departure_airport is not None)
