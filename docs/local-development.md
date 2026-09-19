# Local development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up db`.
3. Install the API with `pip install -e '.[dev]'`.
4. Apply migrations from `apps/api`: `alembic upgrade head`.
5. Start the API from `apps/api`: `uvicorn app.main:app --reload`.
6. Install web dependencies in `apps/web` with `npm install` and run `npm run dev`.

No real travel provider is enabled by default. The application must remain explicit about
missing external configuration.

