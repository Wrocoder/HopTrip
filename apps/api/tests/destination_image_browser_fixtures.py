"""Read-only catalogue selections for imagery tests in the guarded local E2E app."""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from starlette.responses import JSONResponse


def install_destination_image_fixture(app: FastAPI) -> None:
    catalog = json.loads((Path(__file__).resolve().parents[1] / "app/data/destinations.json")
                         .read_text(encoding="utf-8"))["destinations"]
    destinations = {row["slug"]: row for row in catalog}
    selected: list[str] | None = None

    @app.post("/__test__/destination-images")
    def configure(slug: list[str] | None = Query(None, max_length=3)):
        nonlocal selected
        if slug is not None and any(value not in destinations for value in slug):
            raise HTTPException(422, "Unknown fixture destination")
        selected = slug
        return {"selected": selected, "fixture": True}

    @app.middleware("http")
    async def selected_destinations(request, call_next):
        if request.url.path != "/api/v1/destinations" or selected is None:
            return await call_next(request)
        return JSONResponse([
            {"id": 95000 + index, "slug": slug, "city": destinations[slug]["city"],
             "country": destinations[slug]["country"],
             "country_code": destinations[slug]["country_code"],
             "display_name": destinations[slug]["city"], "aliases": [],
             "iata_codes": destinations[slug]["airports"], "timezone": None,
             "destination_type": "CITY", "is_active": True}
            for index, slug in enumerate(selected)
        ])
