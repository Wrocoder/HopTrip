# HopTrip architecture

Poland-first flight deal discovery: FastAPI, Next.js, PostgreSQL, optional worker.
A single Compose migrate service completes before API/worker starts.

Price data providers and affiliate providers are separate domains. Data API v3 produces
cached observations; it does not prove live inventory or program approval. No production
prices are fabricated. Offer uniqueness and observation identity make repeated ingestion
idempotent; explicit aliases resolve provider airport/city codes without creating cities.

One PostgreSQL advisory lock protects the pipeline across scheduler/CLI processes.
Attempts share run_id and record outcomes/retry time. Only transient provider errors retry.
Maintenance expires deals and applies analytics retention independently of successful fetching.

List/detail/redirect share a read-time guard for visibility, status, expiry, verified age
and departure. Source timestamps are preserved; repeated cache downloads do not renew them.
Scoring persists version/components, and regeneration preserves editorial visibility.

DealComponent links to AffiliateProgram; AffiliateClick links to both program and provider.
The shared policy requires active + APPROVED + AFFILIATE_LINK, an exact permitted HTTPS
host and supported stored-link adapter. Public DTOs expose availability/reason/internal path.
The redirect repeats policy checks immediately before recording the click.

Money DTOs use decimal strings. The Polish UI shares cards/formats/text and displays
flight-only costs. Sessions expire after 30 minutes; browser event IDs deduplicate delivery.
Confirmed conversion revenue is grouped by currency without fabricated FX.

Security includes production configuration validation, token comparison, CORS, bounded
bodies and per-process limits. Proxy headers are not trusted by default. Request logs contain
IDs/method/status without URL query or body. See operations for the ingress quota limitation.

Shared-proxy Caddy joins edge and application networks. PostgreSQL stays on the application
network. Backup is validated before atomic publication; restore requires an empty target.

Current verification and external acceptance: [implementation-status.md](implementation-status.md).
