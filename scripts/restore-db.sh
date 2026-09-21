#!/usr/bin/env sh
set -eu
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 BACKUP_FILE EMPTY_TARGET_DATABASE" >&2
  exit 2
fi
BACKUP_FILE="$1"
TARGET="$2"
case "$TARGET" in ""|*[!a-zA-Z0-9_]*) echo "Invalid target database name" >&2; exit 2;; esac
test -s "$BACKUP_FILE"
compose() {
  if [ -n "${COMPOSE_ENV_FILE:-}" ]; then docker compose --env-file "$COMPOSE_ENV_FILE" "$@";
  else docker compose "$@"; fi
}
compose exec -T db pg_restore --list < "$BACKUP_FILE" > /dev/null
TABLES="$(compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$1" -At -v ON_ERROR_STOP=1 -c "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('\''pg_catalog'\'','\''information_schema'\'')"' sh "$TARGET")"
if [ "$TABLES" != "0" ]; then echo "Refuse restore into nonempty database" >&2; exit 2; fi
compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$1" --exit-on-error --single-transaction --no-owner' sh "$TARGET" < "$BACKUP_FILE"
printf 'Restored into %s\n' "$TARGET"
