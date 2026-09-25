#!/usr/bin/env sh
# Restore only into a disposable, network-isolated PostgreSQL container.
set -eu
test "$#" -eq 1 || { echo 'Usage: restore-drill.sh BACKUP_FILE' >&2; exit 2; }
test -s "$1"
CONTAINER="hoptrip-restore-drill-$(date -u +%Y%m%dT%H%M%SZ)-$$"
docker run --detach --name "$CONTAINER" --network none \
  -e POSTGRES_USER=hoptrip_restore -e POSTGRES_DB=hoptrip_restore \
  -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine >/dev/null
trap 'docker rm -fv "$CONTAINER" >/dev/null' EXIT HUP INT TERM
attempt=0
until docker exec "$CONTAINER" pg_isready -U hoptrip_restore -d hoptrip_restore >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  test "$attempt" -lt 30 || { echo 'Restore container not ready' >&2; exit 1; }
  sleep 1
done
docker exec -i "$CONTAINER" pg_restore -U hoptrip_restore -d hoptrip_restore \
  --single-transaction --exit-on-error --no-owner --no-privileges < "$1"
docker exec "$CONTAINER" psql -U hoptrip_restore -d hoptrip_restore -v ON_ERROR_STOP=1 -c \
  'SELECT (SELECT count(*) FROM travel_offers) AS offers, (SELECT count(*) FROM deals) AS deals, (SELECT count(*) FROM destination_aliases) AS aliases, (SELECT version_num FROM alembic_version) AS migration;'
echo 'Restore drill succeeded; disposable database will be removed.'
