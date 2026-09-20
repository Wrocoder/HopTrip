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
- Configuration blocker report: `GET /api/v1/admin/system/status` with
  `X-Admin-Token`; it returns missing external prerequisites without exposing credentials.
- Recent job attempts: `GET /api/v1/admin/jobs` with `X-Admin-Token`.
- Provider/program onboarding: `PATCH /api/v1/admin/providers/{id}` and
  `PATCH /api/v1/admin/programs/{id}` with `X-Admin-Token`; only approved records can be
  enabled, and any non-approved status automatically disables the record.
- Provider capabilities: include `capabilities` in the provider PATCH using values such as
  `DEEP_LINK` or `CONVERSION_API`. Record an externally executed check with
  `POST /api/v1/admin/providers/{id}/health`; this endpoint stores the result and does not call
  a provider by itself.
- Conversion import: `POST /api/v1/admin/conversions` with `X-Admin-Token`; repeat the same
  provider conversion ID safely to update its status. A provider sub-ID can be submitted as
  `tracking_id` (for example, `hoptrip-42`) to resolve the original affiliate click.
- Revenue summary: `GET /api/v1/admin/analytics/summary` with `X-Admin-Token`.
- The revenue summary includes distinct sessions, deal views, redirected clicks, confirmed
  bookings, funnel rates and PLN revenue breakdowns by provider, booking category and deal.
- The job response includes status, attempt number, duration, error and pipeline result.

Provider configuration errors are recorded as failed runs without retries. Transient failures
use the configured bounded exponential backoff. No credentials belong in source control.

For an approved affiliate program that supports a provider sub-ID, set
`AFFILIATE_ALLOWED_HOSTS` to its HTTPS host and `AFFILIATE_TRACKING_QUERY_PARAM` to the exact
query parameter name expected by the provider (for example, `sub_id`). HopTrip then appends a
stable `hoptrip-{click_id}` value to each allowed redirect and stores it with the click. Leave
the tracking parameter empty until the program documents its supported format.

## Production deployment scaffold

The production override keeps PostgreSQL, the API, the worker and Next.js on the internal
Compose network. Caddy is the only service that publishes ports, and terminates HTTPS for the
configured domain.

1. Copy .env.production.example to .env.production.
2. Set the domain and ACME email, URL-safe database password, admin token, provider token and
   approved affiliate host. Keep this file out of source control.
3. Validate the merged Compose configuration:

   ```bash
   docker compose --env-file .env.production \
     -f docker-compose.yml -f docker-compose.production.yml config --quiet
   ```

4. Start the production stack and the scheduled worker:

   ```bash
   docker compose --env-file .env.production \
     -f docker-compose.yml -f docker-compose.production.yml \
     --profile worker up -d --build
   ```

5. Verify https://<domain>/health/ready and the protected system-status endpoint.
6. Create a database backup and retain it according to the chosen retention policy:

   ```bash
   COMPOSE_ENV_FILE=.env.production sh scripts/backup-db.sh
   ```

7. Test a restore during a maintenance window with a selected dump file:

   ```bash
   COMPOSE_ENV_FILE=.env.production sh scripts/restore-db.sh backups/<file>.dump
   ```

After restore, rerun the readiness check and one authenticated admin check. The restore command
is destructive for the configured database and must only run against the intended deployment.

## Coexisting with an existing HTTPS proxy

If another application already owns host ports 80 and 443, use the shared-proxy override. It
removes HopTrip's public Caddy bindings, attaches the internal HopTrip Caddy to an external Docker
network, and lets the existing Caddy terminate HTTPS.

When the existing proxy already has a Docker network, reuse that network instead of creating a
new one. On the current Oracle VM this network is domarion_edge. Add this line to
.env.production:

~~~env
HOPTRIP_EDGE_NETWORK=domarion_edge
~~~

If the existing proxy is not already on the selected network, create it and connect the existing
Caddy container. For this VM, domarion_edge is already present, so skip these two commands.
Replace
`<existing-caddy-container>` with the container identified by `sudo docker ps`:

```bash
sudo docker network create hoptrip-edge
sudo docker network connect hoptrip-edge <existing-caddy-container>
```

Add this site to the existing Caddy configuration, using a hostname that resolves to the VM:

```caddyfile
hoptrip.example.com {
    reverse_proxy hoptrip-caddy:80
}
```

For the current VM, if you keep the existing sslip.io hostname pattern, append this block to
/srv/domarion/app/deploy/oracle/Caddyfile:

~~~caddyfile
hoptrip.141-144-246-78.sslip.io {
    encode zstd gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    reverse_proxy hoptrip-caddy:80
}
~~~

Then validate and start HopTrip with all three Compose files:

```bash
docker compose --env-file .env.production \
  -f docker-compose.yml -f docker-compose.production.yml \
  -f docker-compose.shared-proxy.yml config --quiet

docker compose --env-file .env.production \
  -f docker-compose.yml -f docker-compose.production.yml \
  -f docker-compose.shared-proxy.yml \
  --profile worker up -d --build
```

Reload the existing Caddy after its configuration is updated and verify
`https://hoptrip.example.com/health/ready`. Do not start the default production stack without
the shared-proxy override on a VM where another service already publishes 80 or 443.
