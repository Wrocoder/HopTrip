#!/usr/bin/env sh
set -eu

ENV_FILE="${COMPOSE_ENV_FILE:-.env.production}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="${BACKUP_DIR}/hoptrip-${STAMP}.dump"

mkdir -p "$BACKUP_DIR"
docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.production.yml \
  exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > "$BACKUP_FILE"

echo "Created ${BACKUP_FILE}"
