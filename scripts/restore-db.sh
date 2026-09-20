#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 BACKUP_FILE" >&2
    exit 2
fi

ENV_FILE="${COMPOSE_ENV_FILE:-.env.production}"
BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE" >&2
    exit 2
fi

docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.production.yml \
  exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
  < "$BACKUP_FILE"

echo "Restored ${BACKUP_FILE}"
