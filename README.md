# HopTrip

Poland-first flight deal discovery with real cached prices, history, transparent scoring
and approved affiliate redirects. No fabricated production travel prices.

The local implementation now includes the data-driven public journey, per-program affiliate
policy, idempotent ingestion, PostgreSQL pipeline locking, sessions/conversion analytics,
protected moderation, CI and isolated browser/backup checks. Real data access, program
approval, domain/Oracle deployment and actual commission attribution remain external acceptance.

- [Current implementation and verification](docs/implementation-status.md)
- [18 internal tasks and completion log](docs/independent-development-tasks.md)
- [Пошаговые действия владельца: домен, аккаунты, ссылки](docs/owner-action-guide.md)
- [Operations and safe migration/backup procedures](docs/operations.md)
- [Original audit](docs/project-audit-and-plan.md)

## Run locally

```text
copy .env.example .env
docker compose up --build
```

Web http://localhost:3000; API http://localhost:8000; API docs /docs.
The migrate service runs once before API/worker. Worker is opt-in.
Before upgrading an existing database, follow the preflight and backup procedure in operations.

For an isolated production-like rehearsal with no external token:
`docker compose -f docker-compose.rehearsal.yml up -d --build --wait`.
Web http://localhost:58080; temporary databases are separate from the normal project.

Development setup: [local-development.md](docs/local-development.md).
