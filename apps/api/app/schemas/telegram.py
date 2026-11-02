from app.schemas.alert import AlertFilters
from pydantic import Field


class TelegramFilters(AlertFilters):
    # Unknown connections never satisfy an explicit limit (on either flight).
    max_connections: int | None = Field(default=None, ge=0, le=20)
