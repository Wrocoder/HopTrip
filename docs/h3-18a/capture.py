"""Capture schema and explicitly synthetic aggregates, using only in-memory SQLite."""
import json
from pathlib import Path
from typing import get_args

from app.db.base import Base
from app.main import app
from app.schemas.analytics import EventName
from app.services.usage_metrics import usage_report
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from test_usage_dashboard import END, START, seed

root = Path(__file__).resolve().parent
taxonomy = json.loads((root / "taxonomy.json").read_text(encoding="utf-8"))
assert set(taxonomy["wire_events"]) == set(get_args(EventName))
schema = app.openapi()["components"]["schemas"]["AnalyticsEventCreate"]
assert set(schema["properties"]["event_name"]["enum"]) == set(taxonomy["wire_events"])
engine = create_engine("sqlite://")
Base.metadata.create_all(engine)
with Session(engine) as db:
    seed(db)  # Existing deterministic usage-dashboard fixture; never production events.
    report = usage_report(db, START, END)
    output = {"synthetic": True, "taxonomy_version": taxonomy["version"],
              "schema": schema, "usage": report.model_dump(mode="json")}
    assert output["usage"]["observed_events"] == 17
    assert output["usage"]["observed_sessions"] == 4
engine.dispose()
(root / "synthetic-baseline.json").write_text(
    json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print("Contract matched OpenAPI/EventName; synthetic baseline: 17 events, 4 sessions")
