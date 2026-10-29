#!/usr/bin/env bash
# Installed as root-owned /usr/local/sbin/hoptrip-deploy; not self-updated by CI.
set -Eeuo pipefail
umask 077
sha=${1:-}
[[ $# == 1 && $sha =~ ^[0-9a-f]{40}$ ]] || exit 64
[[ $EUID == 0 ]] || exit 77
root=/opt/hoptrip
exec 9>"$root/deploy.lock"
flock -n 9 || { echo 'Another deployment is running' >&2; exit 75; }
repo=https://github.com/Wrocoder/HopTrip.git
check_deployment_health() {
  local directory=$1
  systemd-run --quiet --wait --pipe --collect --unit="hoptrip-postflight-$$-$RANDOM" \
    --property=EnvironmentFile=/etc/hoptrip/monitor.env \
    --property=WorkingDirectory=/opt/hoptrip \
    /usr/bin/python3 "$directory/scripts/monitor.py" --check-only
}
assert_main() {
  local head
  head=$(git ls-remote "$repo" refs/heads/main | cut -f1)
  [[ $head == "$sha" ]] || { echo 'Refusing a commit that is no longer main' >&2; return 1; }
}
assert_main
if [[ -f $root/deployed-sha && $(cat "$root/deployed-sha") == "$sha" ]]; then
  curl -fsS --max-time 15 https://hoptrip.pl/health/ready
  check_deployment_health "$root/current"
  echo "Already deployed $sha"
  exit 0
fi
stamp=$(date -u +%Y%m%dT%H%M%SZ)
release="$root/releases/$sha-$stamp"
backup="$root/backups/deploy-$stamp-$sha"
mkdir -p "$release" "$backup"
previous=$root
if [[ -L $root/current ]]; then previous=$(readlink -f "$root/current"); fi
test -f "$previous/docker-compose.yml"
compose_at() {
  local directory=$1; shift
  docker compose -p hoptrip --env-file "$root/.env.production" \
    -f "$directory/docker-compose.yml" -f "$directory/docker-compose.production.yml" \
    -f "$directory/docker-compose.domain.yml" --profile worker --profile events "$@"
}
previous_services=(api worker web)
new_services=(api worker web)
writers=(worker api)
if docker inspect hoptrip-events-worker-1 >/dev/null 2>&1; then
  previous_services+=(events-worker)
  writers+=(events-worker)
fi
switched=0
stage=download-source
rollback() {
  local status=$1 line=$2
  trap - ERR
  echo "Deploy failed: stage=$stage line=$line status=$status; backup: $backup" >&2
  if [[ $switched == 1 ]]; then
    echo 'Deployment failed; restoring previous application images (no database downgrade)' >&2
    # A newly introduced events worker must not keep writing during rollback.
    if [[ " ${new_services[*]} " == *' events-worker '* ]]; then
      compose_at "$release" stop events-worker || true
    fi
    for service in "${previous_services[@]}"; do
      docker image tag "hoptrip-$service:rollback-$stamp" "hoptrip-$service:latest"
    done
    compose_at "$previous" up -d --no-deps --no-build --wait --wait-timeout 120 "${previous_services[@]}" || true
  fi
  echo "Failed release $sha; backup: $backup" >&2
  exit "$status"
}
trap 'rollback "$?" "$LINENO"' ERR
curl -fLsS --retry 3 --max-time 120 "https://api.github.com/repos/Wrocoder/HopTrip/tarball/$sha" -o "$backup/source.tar.gz"
stage=extract-source
tar -xzf "$backup/source.tar.gz" --strip-components=1 -C "$release"
printf '%s\n' "$sha" > "$release/RELEASE_SHA"
stage=validate-compose
compose_at "$release" config --quiet
if grep -Eq '^EVENTS_SYNC_ENABLED=(true|1|True)([[:space:]]|$)' "$root/.env.production"; then
  # Consume the producer completely; grep -q may close a pipe early under pipefail.
  compose_at "$release" config --services > "$backup/services.txt"
  grep -qx events-worker "$backup/services.txt"
  new_services+=(events-worker)
fi
stage=preserve-images
for service in "${previous_services[@]}"; do
  image=$(docker inspect --format '{{.Image}}' "hoptrip-$service-1")
  docker image tag "$image" "hoptrip-$service:rollback-$stamp"
done
printf '%s\n' "$previous" > "$backup/previous-source"
stage=build-images
compose_at "$release" build "${new_services[@]}" migrate
stage=application-preflight
compose_at "$release" run --rm --no-deps api /usr/local/bin/python -m app.jobs.preflight
assert_main
# The removed subscription feature was never enabled. Do not strand real subscribers.
stage=monitor-preflight
if check_deployment_health "$release" > "$backup/preflight-checks.json"; then
  cat "$backup/preflight-checks.json"
else
  cat "$backup/preflight-checks.json" >&2
  false
fi
if [[ ! -f $release/apps/api/app/services/alerts.py ]]; then
  subscribers=$(docker exec hoptrip-db-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT count(*) FROM deal_alerts"')
  [[ $subscribers == 0 ]] || { echo 'Refusing to remove alerts with existing subscriber records' >&2; exit 1; }
fi
switched=1
stage=stop-writers
compose_at "$previous" stop "${writers[@]}"
stage=database-backup
docker exec hoptrip-db-1 sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup/database.dump"
test -s "$backup/database.dump"
docker exec -i hoptrip-db-1 pg_restore --list < "$backup/database.dump" > /dev/null
stage=migrate
compose_at "$release" run --rm --no-deps migrate
stage=start-services
compose_at "$release" up -d --no-deps --no-build --wait --wait-timeout 120 "${new_services[@]}"
stage=http-postflight
curl -fsS --retry 10 --retry-all-errors --retry-delay 2 --max-time 15 https://hoptrip.pl/health/ready
curl -fsS --retry 10 --retry-all-errors --retry-delay 2 --max-time 15 https://hoptrip.pl/ -o /dev/null
curl -fsS --max-time 15 https://hoptrip.pl/preview/site/home -o /dev/null
stage=monitor-postflight
if check_deployment_health "$release" > "$backup/postflight-checks.json"; then
  cat "$backup/postflight-checks.json"
else
  cat "$backup/postflight-checks.json" >&2
  false
fi
stage=record-release
ln -sfn "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
printf '%s\n' "$sha" > "$root/deployed-sha.next"
mv -f "$root/deployed-sha.next" "$root/deployed-sha"
switched=0
echo "Deployed $sha; source: $release; backup: $backup"
