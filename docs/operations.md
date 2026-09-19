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
- Conversion import: `POST /api/v1/admin/conversions` with `X-Admin-Token`; repeat the same
  provider conversion ID safely to update its status.
- Revenue summary: `GET /api/v1/admin/analytics/summary` with `X-Admin-Token`.
- The job response includes status, attempt number, duration, error and pipeline result.

Provider configuration errors are recorded as failed runs without retries. Transient failures
use the configured bounded exponential backoff. No credentials belong in source control.

For an approved affiliate program that supports a provider sub-ID, set
`AFFILIATE_ALLOWED_HOSTS` to its HTTPS host and `AFFILIATE_TRACKING_QUERY_PARAM` to the exact
query parameter name expected by the provider (for example, `sub_id`). HopTrip then appends a
stable `hoptrip-{click_id}` value to each allowed redirect and stores it with the click. Leave
the tracking parameter empty until the program documents its supported format.
