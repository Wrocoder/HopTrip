# HopTrip architecture

HopTrip is a Poland-first travel deal discovery platform. The first deployment uses one
FastAPI service, one Next.js service, one PostgreSQL database, and a worker process added
when ingestion begins.

The domain separates travel data providers from affiliate providers. Credentials are read
from the environment and no production prices are fabricated when a provider is unavailable.

