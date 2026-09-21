from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ComponentRead(BaseModel):
    id: int
    component_type: str
    price_pln: Decimal | None
    available: bool
    reason: str
    redirect_path: str | None


class DealRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    origin_code: str = ""
    origin_city: str = ""
    destination_city: str = ""
    destination_slug: str = ""
    trip_type: str = "ONE_WAY"
    price_basis: str = "FLIGHT_PER_PERSON"
    components: list[ComponentRead] = Field(default_factory=list)
    explanation_codes: list[str] = Field(default_factory=list)
    score_version: str = "legacy"
    score_components: dict = Field(default_factory=dict)
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
