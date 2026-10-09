from decimal import Decimal

from app.services.airports import AIRPORT_ALIASES
from pydantic import BaseModel, ConfigDict, computed_field


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

    @computed_field  # type: ignore[prop-decorator]
    @property
    def aliases(self) -> list[str]:
        return list(AIRPORT_ALIASES.get(self.iata_code, ()))


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
