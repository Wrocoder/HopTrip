from typing import Literal

from pydantic import BaseModel, Field, model_validator

QualityPart = Literal["completeness", "travel", "usable_time", "connections", "airports", "leave"]


class TripQualityWeights(BaseModel):
    completeness: int = Field(default=15, ge=0, le=100)
    travel: int = Field(default=20, ge=0, le=100)
    usable_time: int = Field(default=30, ge=0, le=100)
    connections: int = Field(default=15, ge=0, le=100)
    airports: int = Field(default=10, ge=0, le=100)
    leave: int = Field(default=10, ge=0, le=100)

    @model_validator(mode="after")
    def positive_total(self) -> "TripQualityWeights":
        if sum(self.model_dump().values()) == 0:
            raise ValueError("At least one trip quality weight must be positive")
        return self


class TripQualityPolicy(BaseModel):
    weights: TripQualityWeights = Field(default_factory=TripQualityWeights)
    good_travel_minutes: int = Field(default=240, ge=0, le=20160)
    bad_travel_minutes: int = Field(default=1440, ge=1, le=20160)
    target_usable_minutes: int = Field(default=1680, ge=1, le=10080)
    inconvenient_stay_percent: int = Field(default=50, ge=0, le=100)
    night_home_travel_percent: int = Field(default=50, ge=0, le=100)
    connection_penalty_percent: int = Field(default=20, ge=0, le=100)
    long_connection_penalty_percent: int = Field(default=40, ge=0, le=100)
    night_connection_penalty_percent: int = Field(default=25, ge=0, le=100)
    risky_connection_penalty_percent: int = Field(default=50, ge=0, le=100)
    airport_change_penalty_percent: int = Field(default=50, ge=0, le=100)

    @model_validator(mode="after")
    def travel_bounds(self) -> "TripQualityPolicy":
        if self.bad_travel_minutes <= self.good_travel_minutes:
            raise ValueError("Bad travel duration must exceed good travel duration")
        return self


class TripQualityComponent(BaseModel):
    key: QualityPart
    points: int = Field(ge=0)
    max_points: int = Field(ge=0)
    known: bool


class TripRecommendation(BaseModel):
    """Convenient-collection gate, independent of score and flight data quality."""

    version: Literal["trip-recommendation-v1"] = "trip-recommendation-v1"
    recommendation_eligible: bool = False
    # Factual price/date previews may include clearly labelled planning options.
    planning_eligible: bool = False
    label: Literal["CONVENIENT", "REQUIRES_PLANNING", "INSUFFICIENT_DATA"] = "INSUFFICIENT_DATA"
    data_confidence: Literal["COMPLETE", "LIMITED", "INSUFFICIENT"] = "INSUFFICIENT"
    warnings_severity: Literal["NONE", "WARNING", "CRITICAL"] = "WARNING"
    reasons: list[str] = Field(default_factory=list)


class TripQualityAssessment(BaseModel):
    version: Literal["trip-quality-v1"] = "trip-quality-v1"
    status: Literal["KNOWN", "PARTIAL", "UNKNOWN"] = "UNKNOWN"
    score: int | None = Field(default=None, ge=0, le=100)
    policy: TripQualityPolicy = Field(default_factory=TripQualityPolicy)
    components: list[TripQualityComponent] = Field(default_factory=list)
    reasons: list[str] = Field(default_factory=list)
    recommendation: TripRecommendation = Field(default_factory=TripRecommendation)
