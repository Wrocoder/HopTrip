"""Refresh exact-trip cached quotes, rebuild deals and sync their selected-ticket links."""
import argparse
import asyncio
import json
from dataclasses import asdict

from app.db.session import SessionLocal
from app.services.deals import generate_fresh_deals
from app.services.jobs import PipelineBusy, pipeline_lock
from app.services.partner_links import sync_partner_links
from app.services.price_refresh import refresh_prices
from app.services.statistics import recalculate_route_statistics


async def run(offer_ids: list[int] | None = None) -> dict:
    with pipeline_lock(SessionLocal) as acquired:
        if not acquired:
            raise PipelineBusy("Pipeline busy")
        with SessionLocal() as db:
            result = await refresh_prices(db, offer_ids=offer_ids)
            statistics = recalculate_route_statistics(db)
            generated = generate_fresh_deals(db)
            links = await sync_partner_links(db)
    return {"price_refresh": asdict(result), "statistics_routes": statistics,
            "generated_deals": generated, "partner_links": asdict(links),
            "live_availability_verified": False}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offer-id", type=int, action="append", dest="offer_ids")
    args = parser.parse_args()
    try:
        result = asyncio.run(run(args.offer_ids))
    except Exception:
        print(json.dumps({"status": "REFRESH_FAILED"}))
        raise SystemExit(2) from None
    print(json.dumps(result))


if __name__ == "__main__":
    main()
