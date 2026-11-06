"""Local fixture diagnostic only: no application/test source modifications."""
import json
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest


class FutureDeparture:
    def pytest_runtest_setup(self, item):
        original = item.module.offer

        def future_offer(db, **kwargs):
            kwargs["departure"] = datetime.now(UTC) + timedelta(days=7)
            return original(db, **kwargs)

        item.module.offer = future_offer
        schema = sys.modules["app.schemas.analytics"]
        Path("docs/h3-18b2/telegram-probe-environment.json").write_text(json.dumps({
            "schema_file": schema.__file__,
            "contains_trip_update": "TRIP_UPDATE" in str(schema.EventName),
            "probe": "Only test fixture departure moved seven days into the future; production code unchanged",
        }, indent=2), encoding="utf-8")


raise SystemExit(pytest.main([
    "apps/api/tests/test_telegram.py::test_real_api_to_queue_to_mock_telegram_journey",
    "-q", "--junitxml=docs/h3-18b2/telegram-future-fixture.xml",
], plugins=[FutureDeparture()]))
