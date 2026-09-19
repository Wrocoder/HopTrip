# Operations

## One-shot ingestion

Run the provider pipeline from the API image when a single refresh is needed:

```bash
docker compose run --rm api python -m app.jobs.runner
```

The command exits with code `2` when provider credentials are missing or the provider rejects
the request. Every attempt is stored in `job_runs`.

## Scheduled ingestion

The scheduler is opt-in so a development stack does not repeatedly call a provider by accident:

```bash
docker compose --profile worker up -d worker
docker compose --profile worker logs -f worker
```

Set `TRAVELPAYOUTS_API_TOKEN`, `PIPELINE_INTERVAL_SECONDS`, `PIPELINE_MAX_ATTEMPTS` and
`PIPELINE_RETRY_DELAY_SECONDS` in `.env` before starting it. Stop it with:

```bash
docker compose --profile worker stop worker
```

## Health and job history

- Readiness: `GET /health/ready`.
- Recent job attempts: `GET /api/v1/admin/jobs` with `X-Admin-Token`.
- The job response includes status, attempt number, duration, error and pipeline result.

Provider configuration errors are recorded as failed runs without retries. Transient failures
use the configured bounded exponential backoff. No credentials belong in source control.
