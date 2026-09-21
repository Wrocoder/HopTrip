# Local development

Use Python 3.12 and Node 22. In PyCharm select the project SDK.

1. Copy .env.example to .env.
2. Start PostgreSQL: docker compose up -d db.
3. Install locked API dependencies: python -m pip install -r requirements.lock,
   then python -m pip install --no-deps -e .
4. From apps/api: python -m alembic upgrade head.
   Existing databases: first follow backup/preflight in operations.md.
5. From apps/api: python -m uvicorn app.main:app --reload --no-access-log.
6. In apps/web: npm ci; npm run dev.
7. Run checks from the repository root: python -m ruff check apps/api,
   python -m mypy, python -m pytest -q.
8. In apps/web: npm run lint; npm run typecheck; npm run build.

For PostgreSQL integration tests use docker-compose.test.yml and TEST_DATABASE_URL.
For browser tests use npm run test:e2e; configure HOPTRIP_TEST_PYTHON on Windows.
Detailed commands and database isolation are in [operations.md](operations.md).

No real provider is enabled by default. After credentials and terms are accepted,
run python -m app.jobs.runner from apps/api; optionally enable the worker profile.
Run python -m app.jobs.maintenance for token-free expiry and analytics retention.

Admin requests use X-Admin-Token. Program hosts/tracking belong to AffiliateProgram;
the obsolete global host variables no longer authorize redirects.

If the dev server returns 404 for existing routes while the API returns valid data,
stop Next.js and Playwright, remove only `apps/web/.next` (generated build cache),
then restart the dev server. This resolved a stale route cache during the
2026-09-21 browser run. Do not run type generation/build commands against the same
local output directory while a browser test server is running.
