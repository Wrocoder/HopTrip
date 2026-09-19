# HopTrip implementation status

This file is the working progress ledger for the roadmap in `doc/MasterPrompt.md`.
It records what is implemented in the repository, what is intentionally pending, and
which external configuration is required before a phase can be called complete.

Last updated: 2026-09-20

## Current milestone

**Phase 6 — affiliate and analytics foundation**

The repository has the interfaces and storage needed to ingest real provider responses,
calculates route price distributions from stored observations, and exposes generated deals
through the public API. No external provider credentials are configured, so no production
travel prices are generated locally.

## Roadmap checklist

| Phase | Status | Evidence / next exit criterion |
| --- | --- | --- |
| 0. Repository and business discovery | Done | Repository audit, architecture plan, provider matrix in `docs/providers.md` |
| 1. Product foundation | Done | FastAPI, Next.js, PostgreSQL Compose, Alembic, catalog/admin models and health endpoints; runtime verified in Docker |
| 2. First real data source | In progress | Travelpayouts adapter, configurable origins and CLI pipeline exist; next: configured-token integration run |
| 3. Price history | In progress | Route statistics, repeatable runner, persisted job history, bounded retries and optional worker schedule exist; next: configured-token run |
| 4. Deal engine | In progress | Flight-only Deal, components, score, explanations, freshness and repeatable generation job exist; next: populated real offers |
| 5. Public website | In progress | Homepage, live API-backed list/detail routes and destination catalog exist; next: populate them with a configured provider |
| 6. Affiliate bootstrap | In progress | Safe `/go/{deal}/{component}` validation and click tracking exist; next: approved program and configured outbound links |
| 7. Second monetization source | Planned | Add an actually approved second program |
| 8. Accommodation | Planned | Real hotel source; no invented hotel costs |
| 9. SEO foundation | In progress | Dynamic airport/destination pages, metadata, sitemap and seeded route catalog exist; next: populate pages with real deals and route statistics |
| 10. Analytics | In progress | Anonymous events, outbound clicks, idempotent conversion import and protected revenue summary exist; next: provider conversion feed |
| 11. Affiliate expansion | Planned | Apply after useful site and initial traffic |
| 12. Distribution | Planned | Telegram publication adapter |
| 13. Oracle VM deployment | Planned | Caddy, Compose deployment, backups and restore test |

## Implemented repository pieces

- `apps/api/app/models/location.py`: Airport, Destination;
- `apps/api/app/models/affiliate.py`: AffiliateProvider, AffiliateProgram, capabilities and onboarding states;
- `apps/api/app/models/data_provider.py`: independent travel-data provider registry;
- `apps/api/app/models/offer.py`: TravelOffer and PriceObservation;
- `apps/api/app/providers/`: provider-neutral contracts and Travelpayouts adapter;
- `apps/api/app/services/ingestion.py`: idempotent offer persistence and observation creation;
- `apps/api/app/services/currency.py`: PLN-only safe converter until an exchange-rate source is configured;
- `apps/api/app/services/statistics.py`: route price distributions and confidence;
- `apps/api/app/services/scoring.py`: configurable explainable Deal Score;
- `apps/api/app/services/deals.py`: flight-only deal generation without invented accommodation costs;
- `apps/api/app/jobs/pipeline.py`: configurable provider → history → statistics → deals orchestration;
- `apps/api/app/jobs/runner.py`: cron/worker-friendly repeatable pipeline command;
- `apps/api/app/jobs/scheduler.py`: optional interval worker around the tracked pipeline;
- `docs/operations.md`: one-shot, scheduled-worker and job-history runbook;
- `apps/api/app/services/jobs.py`: durable success/failure tracking for pipeline executions;
- `apps/api/app/api/admin.py`: protected recent job history endpoint;
- `apps/api/app/models/conversion.py`: idempotent affiliate conversion and commission records;
- `apps/api/app/schemas/conversion.py`: validated admin conversion import contract;
- `apps/api/app/api/catalog.py`: read-only deal list/detail endpoints with route and date filters;
- Alembic migrations `0001` through `0010`;
- FastAPI health, catalog and protected admin endpoints;
- Next.js Polish homepage, live deal list and deal detail pages;
- SEO-friendly `/from/{iata_code}` and `/destinations/{slug}` pages with dynamic metadata;
- Dynamic `sitemap.xml` and `robots.txt` with catalog-backed URLs and safe fallbacks;
- Seeded destination catalog in migration `0008_seed_destination_catalog` for route resolution;
- Docker Compose and API migration entrypoint;
- Repeatable ingestion and deal-generation jobs in `apps/api/app/jobs/`;
- Freshness guard that hides deals not re-verified within 48 hours;
- Anonymous `DEAL_VIEW` tracking with event storage and admin summary endpoint;
- Safe outbound click endpoint with HTTPS host allowlist and rejected/unconfigured click audit;
- tests and Ruff configuration.

## Verification history

Latest local checks:

- Ruff: passed;
- pytest: 23 passed;
- Alembic offline SQL generation: passed through migration `0010`;
- Next.js production build: passed;
- Docker Compose config parsing: passed.
- Docker runtime: PostgreSQL, API and web are up; migrations through `0010` applied; readiness endpoint passed.
- Web security audit: `npm audit --omit=dev --audit-level=high` reports zero vulnerabilities; Next.js is `16.3.5`.
- Docker runtime smoke checks: `/health/ready` returns `ready`; `/api/v1/deals` returns an
  empty list until real offers are ingested.
- Web runtime smoke checks: `/` and `/deals` return HTTP 200; `/deals` renders the honest
  empty state while the provider has no configured token.
- SEO route build checks: Next.js includes `/from/[iata_code]`, `/destinations/[slug]`,
  `/sitemap.xml` and `/robots.txt`.
- Analytics checks: `DEAL_VIEW` event accepted with HTTP 202 and migration `0006_analytics_events`
  generated successfully.
- Affiliate checks: migration `0007_affiliate_clicks` applied; unknown deal returns HTTP 404;
  unconfigured components never redirect.
- Destination catalog checks: migration `0008_seed_destination_catalog` applied; API returns
  10 catalog destinations and destination pages return HTTP 200.
- Pipeline checks: missing provider credentials exit cleanly with code `2`; configured origins
  default to all seven seeded Polish airports.
- Job checks: successful and failed pipeline executions persist status, duration, error and result;
  transient failures retry with bounded backoff, configuration failures do not retry, and protected
  `/api/v1/admin/jobs` exposes the latest 50 runs.
- Scheduler checks: worker profile parses successfully and remains opt-in until a provider token
  is configured.
- Conversion checks: protected admin upsert is idempotent by provider conversion ID; analytics
  summary reports confirmed PLN commission without pretending to convert other currencies.
- API filter smoke checks: `/api/v1/deals?origin=WRO` returns `[]`; invalid date ranges return
  validation error `422`.

## Open decisions and blockers

1. Choose and configure the first real data provider token. Travelpayouts is currently the
   implemented adapter; Amadeus remains a separate candidate.
2. Add an exchange-rate provider before accepting non-PLN observations into PLN history.
3. Confirm provider terms and coverage for Polish low-cost routes.
4. Obtain approval and generated links for the first affiliate program before enabling redirects;
   configure its HTTPS host in `AFFILIATE_ALLOWED_HOSTS`.

## Definition of next milestone

Phase 2 is complete when a configured provider response can be fetched by a repeatable job,
resolved against the catalog, stored as a fresh `TravelOffer`, and represented by a durable
`PriceObservation` without duplicate offers or fabricated currency conversions.

Phase 3 is complete when the ingestion job recalculates route statistics after each successful
batch, persists execution status, retries transient failures without duplicate offers, and runs
from a production scheduler.

## Runtime verification

The local Docker stack is currently running:

```text
hoptrip-db-1   healthy
hoptrip-api-1  up on :8000
hoptrip-web-1  up on :3000
```
