from dataclasses import asdict, dataclass, field

from app.config import get_settings
from app.db.session import SessionLocal
from app.jobs.ingest import fetch_travelpayouts_offers
from app.providers.base import SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.services.currency import PlnOnlyConverter
from app.services.deals import generate_fresh_deals
from app.services.ingestion import IngestionResult, ingest_offers
from app.services.partner_links import LinkSyncResult, sync_partner_links
from app.services.statistics import recalculate_route_statistics


@dataclass(frozen=True)
class PipelineResult:
    ingestion: IngestionResult
    statistics_routes: int
    generated_deals: int
    provider_searches: list[dict[str, str | int]] = field(default_factory=list)
    partner_links: LinkSyncResult = field(default_factory=LinkSyncResult)


async def run_travelpayouts_pipeline() -> PipelineResult:
    provider = TravelpayoutsDataProvider()
    origins = tuple(
        origin.strip().upper()
        for origin in get_settings().ingestion_origins.split(",")
        if origin.strip()
    ) or ("WRO",)
    offers = []
    provider_searches = []
    for origin in origins:
        origin_offers = await fetch_travelpayouts_offers(provider, SearchQuery(origin=origin))
        offers.extend(origin_offers)
        provider_searches.append(
            {
                "origin": origin,
                "offers_returned": len(origin_offers),
                **asdict(provider.diagnostics),
            }
        )
    with SessionLocal() as db:
        ingestion = ingest_offers(
            db,
            provider_code=provider.code,
            offers=offers,
            converter=PlnOnlyConverter(),
        )
        statistics_routes = recalculate_route_statistics(db)
        generated_deals = generate_fresh_deals(db)
        partner_links = await sync_partner_links(db)
    return PipelineResult(
        ingestion, statistics_routes, generated_deals, provider_searches, partner_links
    )
