from app.db.session import SessionLocal
from app.providers.base import RawTravelOffer, SearchQuery
from app.providers.travelpayouts import TravelpayoutsDataProvider
from app.services.currency import PlnOnlyConverter
from app.services.ingestion import ingest_offers


async def fetch_travelpayouts_offers(
    provider: TravelpayoutsDataProvider,
    query: SearchQuery,
) -> list[RawTravelOffer]:
    return await provider.search(query=query)


async def run_travelpayouts_ingestion() -> None:
    provider = TravelpayoutsDataProvider()
    # Search scheduling and query selection will be added with the worker. The adapter
    # remains explicit about missing credentials and never supplies fallback prices.
    offers = await fetch_travelpayouts_offers(provider, SearchQuery(origin="WRO"))
    with SessionLocal() as db:
        ingest_offers(
            db,
            provider_code=provider.code,
            offers=offers,
            converter=PlnOnlyConverter(),
        )
