"""Backfill only route evidence for currently fresh offers, without fetching prices."""
import asyncio
import json
from dataclasses import asdict

from app.db.session import SessionLocal
from app.services.deals import generate_fresh_deals
from app.services.route_enrichment import enrich_routes


async def run() -> dict:
    with SessionLocal() as db:
        result = await enrich_routes(db)
        generated = generate_fresh_deals(db)
        return {"route_enrichment": asdict(result), "generated_deals": generated}


if __name__ == "__main__":
    print(json.dumps(asyncio.run(run())))
