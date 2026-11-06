from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from app.schemas.airport_context import AirportContext
from app.schemas.destination_time import DestinationTime
from app.schemas.score import ScoreExplanation
from app.schemas.weekend import WeekendAssessment
from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

FlightQualityReason = Literal[
    "UNVERIFIED_SOURCE", "MISSING_ORIGIN", "MISSING_DESTINATION", "MISSING_RETURN_AIRPORTS",
    "MISSING_DATES", "INVALID_DATES", "AIRPORT_MISMATCH", "INVALID_DURATION",
    "CONFLICTING_METADATA", "MISSING_TIMES", "ESTIMATED_TIMES", "UNKNOWN_TIMEZONE",
    "UNKNOWN_STOPS", "UNKNOWN_CARRIER",
]


def _unknown_quality_reasons() -> list[FlightQualityReason]:
    return ["UNVERIFIED_SOURCE"]


class FlightQuality(BaseModel):
    version: Literal["flight-quality-v1"] = "flight-quality-v1"
    status: Literal["COMPLETE", "PARTIAL", "CRITICAL_INCOMPLETE"] = "CRITICAL_INCOMPLETE"
    reasons: list[FlightQualityReason] = Field(default_factory=_unknown_quality_reasons)

    @computed_field  # type: ignore[prop-decorator]  # Pydantic supports this property decorator stack.
    @property
    def recommendation_eligible(self) -> bool:
        """Quality prerequisite only; freshness and link availability are checked separately."""
        return self.status != "CRITICAL_INCOMPLETE"


class ComponentRead(BaseModel):
    id: int
    component_type: str
    price_pln: Decimal | None
    available: bool
    reason: str
    redirect_path: str | None
    partner_name: str | None = None


class FlightLeg(BaseModel):
    origin_airport: str
    destination_airport: str
    origin_timezone: str | None = None
    destination_timezone: str | None = None
    departure: datetime
    arrival: datetime
    airline_code: str | None = None
    airline_name: str | None = None
    flight_number: str | None = None


class TripTimeline(BaseModel):
    version: Literal["trip-timeline-v1"] = "trip-timeline-v1"
    local_outbound_departure_date: date | None = None
    local_destination_arrival_date: date | None = None
    local_return_departure_date: date | None = None
    local_return_arrival_date: date | None = None
    nights_at_destination: int | None = Field(default=None, ge=0)
    nights_estimated: bool = False
    return_arrival_estimated: bool = False
    return_arrival_day_offset: int | None = None
    outbound_elapsed_minutes: int | None = Field(default=None, ge=0)
    return_elapsed_minutes: int | None = Field(default=None, ge=0)
    journey_elapsed_minutes: int | None = Field(default=None, ge=0)


class FlightFacts(BaseModel):
    timeline: TripTimeline = Field(default_factory=TripTimeline)
    outbound_legs: list[FlightLeg] = Field(default_factory=list)
    return_legs: list[FlightLeg] = Field(default_factory=list)
    origin_timezone: str | None = None
    destination_timezone: str | None = None
    airline_name: str | None = None
    outbound_arrival_calculated: bool = False
    return_arrival_calculated: bool = False
    origin_airport: str | None = None
    destination_airport: str | None = None
    return_origin_airport: str | None = None
    return_destination_airport: str | None = None
    return_origin_timezone: str | None = None
    return_destination_timezone: str | None = None
    destination_code: str | None = None
    airline_code: str | None = None
    outbound_stops: int | None = None
    return_stops: int | None = None
    outbound_departure: datetime | None = None
    outbound_arrival: datetime | None = None
    return_departure: datetime | None = None
    return_arrival: datetime | None = None
    destination_interval_minutes: int | None = None


class PriceFreshness(BaseModel):
    observed_at: datetime | None = None
    observation_basis: Literal["SOURCE", "FIRST_SEEN"] | None = None
    fetched_at: datetime | None = None
    # Cache ingestion never constitutes a seller inventory check.
    availability_checked_at: datetime | None = None
    hidden_after: datetime | None = None
    max_age_hours: int = 48


class DealRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    origin_code: str = ""
    origin_city: str = ""
    destination_city: str = ""
    destination_slug: str = ""
    destination_country_code: str = ""
    events_supported: bool = False
    trip_type: str = "ONE_WAY"
    price_basis: str = "FLIGHT_PER_PERSON"
    flight_facts: FlightFacts = Field(default_factory=FlightFacts)
    flight_quality: FlightQuality = Field(default_factory=FlightQuality)
    weekend_assessment: WeekendAssessment = Field(default_factory=WeekendAssessment)
    destination_time: DestinationTime = Field(default_factory=DestinationTime)
    airport_context: AirportContext = Field(default_factory=AirportContext)
    components: list[ComponentRead] = Field(default_factory=list)
    explanation_codes: list[str] = Field(default_factory=list)
    score_version: str = "legacy"
    score_components: dict = Field(default_factory=dict)

    @field_validator("score_components", mode="before")
    @classmethod
    def normalize_score_components(cls, value: object) -> dict:
        # Legacy/corrupt JSON must not break an otherwise available offer.
        # explain_score separately rejects it; the public contract stays an object.
        return value if isinstance(value, dict) else {}

    score_explanation: ScoreExplanation = Field(default_factory=ScoreExplanation)
    price_freshness: PriceFreshness = Field(default_factory=PriceFreshness)
    slug: str
    origin_airport_id: int
    destination_id: int
    trip_start: date
    trip_end: date
    nights: int | None
    travelers: int
    flight_price_pln: Decimal | None
    hotel_price_pln: Decimal | None
    total_estimated_pln: Decimal
    price_per_person_pln: Decimal
    historical_baseline_pln: Decimal | None
    discount_percent: Decimal | None
    deal_score: int
    confidence: Decimal
    explanation: list[str]
    last_verified_at: datetime
    expires_at: datetime | None
    is_featured: bool


class DealPage(BaseModel):
    items: list[DealRead]
    total: int
    offset: int
    limit: int
