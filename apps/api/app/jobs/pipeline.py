from dataclasses import dataclass

from app.config import get_settings
from app.db.session import SessionLocal
from app.jobs.ingest import fetch_travelpayouts_offers
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.services.currency import PlnOnlyConverter
from app.services.deals import generate_fresh_deals
from app.services.ingestion import IngestionResult, ingest_offers
from app.services.statistics import recalculate_route_statistics


@dataclass(frozen=True)
class PipelineResult:
    ingestion: IngestionResult
    statistics_routes: int
    generated_deals: int


async def run_travelpayouts_pipeline() -> PipelineResult:
    provider = TravelpayoutsDataProvider()
    origins = tuple(
        origin.strip().upper()
        for origin in get_settings().ingestion_origins.split(",")
        if origin.strip()
    ) or ("WRO",)
    offers = []
    for origin in origins:
        offers.extend(await fetch_travelpayouts_offers(provider, SearchQuery(origin=origin)))
    with SessionLocal() as db:
        ingestion = ingest_offers(
            db,
            provider_code=provider.code,
            offers=offers,
            converter=PlnOnlyConverter(),
        )
        statistics_routes = recalculate_route_statistics(db)
        generated_deals = generate_fresh_deals(db)
    return PipelineResult(ingestion, statistics_routes, generated_deals)
