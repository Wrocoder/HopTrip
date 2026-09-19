# HopTrip architecture

HopTrip is a Poland-first travel deal discovery platform. The first deployment uses one
FastAPI service, one Next.js service, one PostgreSQL database, and a worker process added
when ingestion begins.

The domain separates travel data providers from affiliate providers. Credentials are read
from the environment and no production prices are fabricated when a provider is unavailable.

The ingestion pipeline is a repeatable command (`app.jobs.runner`). Each execution records
its status, duration, error and result in `job_runs`; the optional Compose `worker` profile runs
the scheduler without putting scheduling logic into the API process. A host cron job can also
invoke the one-shot runner directly.
