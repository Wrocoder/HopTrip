# HopTrip

HopTrip is a Poland-first travel deal discovery platform. It compares real travel offers,
keeps price history, explains deal quality, and redirects users through approved affiliate
providers.

## Current status

The Phase 6 affiliate and analytics foundation is in place:

- FastAPI API with health, catalog, and protected provider/program admin endpoints;
- PostgreSQL 16 and Alembic migration;
- initial Polish departure-airport catalog;
- provider/program onboarding model;
- Next.js web pages in Polish with API-backed deal list, detail page and route filters;
- SEO-ready airport and destination pages with dynamic metadata;
- Anonymous deal-view analytics and safe affiliate click tracking;
- Idempotent affiliate conversion intake and confirmed PLN revenue summary;
- Optional provider sub-ID tracking on allowlisted affiliate redirects;
- Persistent pipeline job history with protected admin diagnostics;
- Docker Compose configuration.

No production travel prices are fabricated. External data providers remain disabled until
credentials and terms are configured.

## Run locally

```text
copy .env.example .env
docker compose up --build
```

The API is available at `http://localhost:8000`, the web app at `http://localhost:3000`,
and API documentation at `http://localhost:8000/docs`.

For development without Docker, see [docs/local-development.md](docs/local-development.md).

Current implementation progress is tracked in [docs/implementation-status.md](docs/implementation-status.md).
