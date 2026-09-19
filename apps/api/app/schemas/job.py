from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class JobRunRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_type: str
    status: str
    attempt: int
    started_at: datetime
    finished_at: datetime | None = None
    duration_ms: int | None = None
    error: str | None = None
    result_json: dict[str, Any]
