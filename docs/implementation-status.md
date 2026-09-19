# HopTrip implementation status

This file is the working progress ledger for the roadmap in `doc/MasterPrompt.md`.
It records what is implemented in the repository, what is intentionally pending, and
which external configuration is required before a phase can be called complete.

Last updated: 2026-09-19

## Current milestone

**Phase 5 — public deal surface**

The repository has the interfaces and storage needed to ingest real provider responses,
calculates route price distributions from stored observations, and exposes generated deals
through the public API. No external provider credentials are configured, so no production
travel prices are generated locally.

## Roadmap checklist

| Phase | Status | Evidence / next exit criterion |
| --- | --- | --- |
| 0. Repository and business discovery | Done | Repository audit, architecture plan, provider matrix in `docs/providers.md` |
| 1. Product foundation | Done | FastAPI, Next.js, PostgreSQL Compose, Alembic, catalog/admin models and health endpoints; runtime verified in Docker |
| 2. First real data source | In progress | Travelpayouts adapter and persistence exist; next: configured-token integration run |
| 3. Price history | In progress | Route statistics and pipeline recalculation after ingestion exist; next: scheduled production execution |
| 4. Deal engine | In progress | Flight-only Deal, components, score, explanations, freshness and repeatable generation job exist; next: populated real offers |
| 5. Public website | In progress | Homepage, live API-backed list and detail routes exist; next: populate them with a configured provider |
| 6. Affiliate bootstrap | Pending approval | Provider adapter, safe redirect, click tracking and approved program |
| 7. Second monetization source | Planned | Add an actually approved second program |
| 8. Accommodation | Planned | Real hotel source; no invented hotel costs |
| 9. SEO foundation | In progress | Dynamic airport and destination pages with metadata exist; next: populate pages with real deals and route statistics |
| 10. Analytics | In progress | Anonymous deal-view event, event storage and protected summary endpoint exist; next: outbound click events and conversion import |
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
- `apps/api/app/jobs/pipeline.py`: repeatable provider → history → statistics → deals orchestration;
- `apps/api/app/api/catalog.py`: read-only deal list/detail endpoints with route and date filters;
- Alembic migrations `0001` through `0005`;
- FastAPI health, catalog and protected admin endpoints;
- Next.js Polish homepage, live deal list and deal detail pages;
- SEO-friendly `/from/{iata_code}` and `/destinations/{slug}` pages with dynamic metadata;
- Dynamic `sitemap.xml` and `robots.txt` with catalog-backed URLs and safe fallbacks;
- Docker Compose and API migration entrypoint;
- Repeatable ingestion and deal-generation jobs in `apps/api/app/jobs/`;
- Freshness guard that hides deals not re-verified within 48 hours;
- Anonymous `DEAL_VIEW` tracking with event storage and admin summary endpoint;
- tests and Ruff configuration.

## Verification history

Latest local checks:

- Ruff: passed;
- pytest: 9 passed;
- Alembic offline SQL generation: passed through migration `0005`;
- Next.js production build: passed;
- Docker Compose config parsing: passed.
- Docker runtime: PostgreSQL, API and web are up; migrations through `0005` applied; readiness endpoint passed.
- Web security audit: `npm audit --omit=dev --audit-level=high` reports zero vulnerabilities; Next.js is `16.3.5`.
- Docker runtime smoke checks: `/health/ready` returns `ready`; `/api/v1/deals` returns an
  empty list until real offers are ingested.
- Web runtime smoke checks: `/` and `/deals` return HTTP 200; `/deals` renders the honest
  empty state while the provider has no configured token.
- SEO route build checks: Next.js includes `/from/[iata_code]`, `/destinations/[slug]`,
  `/sitemap.xml` and `/robots.txt`.
- Analytics checks: `DEAL_VIEW` event accepted with HTTP 202 and migration `0006_analytics_events`
  generated successfully.
- API filter smoke checks: `/api/v1/deals?origin=WRO` returns `[]`; invalid date ranges return
  validation error `422`.

## Open decisions and blockers

1. Choose and configure the first real data provider token. Travelpayouts is currently the
   implemented adapter; Amadeus remains a separate candidate.
2. Add an exchange-rate provider before accepting non-PLN observations into PLN history.
3. Confirm provider terms and coverage for Polish low-cost routes.
4. Obtain approval and generated links for the first affiliate program before enabling redirects.

## Definition of next milestone

Phase 2 is complete when a configured provider response can be fetched by a repeatable job,
resolved against the catalog, stored as a fresh `TravelOffer`, and represented by a durable
`PriceObservation` without duplicate offers or fabricated currency conversions.

Phase 3 is complete when the ingestion job recalculates route statistics after each successful
batch and the deal engine can consume median and confidence without recomputing raw history.

## Runtime verification

The local Docker stack is currently running:

```text
hoptrip-db-1   healthy
hoptrip-api-1  up on :8000
hoptrip-web-1  up on :3000
```
