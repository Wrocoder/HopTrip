#!/usr/bin/env sh
set -eu
umask 077
# Uses standard COMPOSE_FILE, COMPOSE_PROJECT_NAME and --env-file through COMPOSE_ENV_FILE.
compose() {
  if [ -n "${COMPOSE_ENV_FILE:-}" ]; then docker compose --env-file "$COMPOSE_ENV_FILE" "$@";
  else docker compose "$@"; fi
}
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)-$$"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/hoptrip-$STAMP.dump"
PARTIAL="$BACKUP_FILE.partial"
trap 'rm -f "$PARTIAL"' EXIT HUP INT TERM
compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$PARTIAL"
test -s "$PARTIAL"
compose exec -T db pg_restore --list < "$PARTIAL" > /dev/null
mv "$PARTIAL" "$BACKUP_FILE"
printf 'Created %s\n' "$BACKUP_FILE"
# No implicit removal: operator reviews retention output before pruning backups.
