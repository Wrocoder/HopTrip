from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class AirportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    iata_code: str
    name: str
    city: str
    country_code: str
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    timezone: str | None = None
    is_active: bool


class DestinationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    city: str
    country: str
    country_code: str
    slug: str
    timezone: str | None = None
    destination_type: str
    is_active: bool
