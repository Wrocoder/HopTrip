from typing import Literal

from pydantic import BaseModel, Field

Direction = Literal["OUTBOUND", "RETURN"]


class ConnectionPolicy(BaseModel):
    long_layover_minutes: int = Field(default=360, ge=1, le=10080)
    # A product warning threshold, never an airport's confirmed minimum connection time.
    short_transfer_minutes: int = Field(default=90, ge=1, le=10080)


class ConnectionRead(BaseModel):
    direction: Direction
    after_leg: int = Field(ge=1, le=20)
    arrival_airport: str
    departure_airport: str
    duration_minutes: int = Field(ge=0)
    overnight: bool | None = None
    airport_change: bool
    long_layover: bool
    risky_transfer: bool
    # The current provider contract contains no confirmed transfer-protection data.
    protection: Literal["UNKNOWN"] = "UNKNOWN"


class ConnectionAssessment(BaseModel):
    version: Literal["connections-v1"] = "connections-v1"
    status: Literal["KNOWN", "PARTIAL", "UNKNOWN"] = "UNKNOWN"
    policy: ConnectionPolicy = Field(default_factory=ConnectionPolicy)
    connections: list[ConnectionRead] = Field(default_factory=list)
    unknown_directions: list[Direction] = Field(default_factory=list)
