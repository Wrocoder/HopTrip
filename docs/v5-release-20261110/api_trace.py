"""Local fixture diagnostic only. No query, body, headers or personal data logged."""
import asyncio
import json
import os
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

if os.environ.get("HOPTRIP_E2E") != "1":
    raise RuntimeError("Only the isolated E2E fixture may use this module")
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "apps/api/tests"))
from e2e_app import app as fixture_app  # noqa: E402

TARGETS = {"/api/v1/deals", "/api/v1/airports", "/api/v1/destinations"}


def record(**row):
    with open(os.environ["HOPTRIP_API_PROBE_LOG"], "a", encoding="utf-8") as stream:
        stream.write(json.dumps({"at": datetime.now(UTC).isoformat(), **row}) + "\n")


async def heartbeat():
    previous = time.monotonic()
    while True:
        await asyncio.sleep(0.25)
        now = time.monotonic()
        if now - previous > 1:
            record(event="loop-delay", elapsed_ms=round((now - previous) * 1000))
        previous = now


class Trace:
    def __init__(self, wrapped):
        self.wrapped = wrapped
        self.timer = None

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.wrapped(scope, receive, send)
        if self.timer is None:
            self.timer = asyncio.create_task(heartbeat())
        endpoint = scope["path"]
        started = time.monotonic()
        if endpoint in TARGETS:
            record(event="received", endpoint=endpoint)

        async def response(message):
            if endpoint in TARGETS and message["type"] == "http.response.start":
                record(event="response", endpoint=endpoint, status=message["status"],
                       elapsed_ms=round((time.monotonic() - started) * 1000))
            await send(message)

        await self.wrapped(scope, receive, response)


app = Trace(fixture_app)
