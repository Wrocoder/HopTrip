#!/usr/bin/env bash
# Isolated command doubles: never access a real daemon, server, or credential file.
set -euo pipefail
repository=$(cd "$(dirname "$0")/../.." && pwd -P)
mkdir -p "$repository/.cache"
fixture=$(mktemp -d "$repository/.cache/deploy-test.XXXXXX")
[[ $(cd "$fixture" && pwd -P) == "$repository/.cache/deploy-test."* ]] || exit 9
trap 'status=$?; if [[ $status != 0 ]]; then cat "$fixture"/*.log 2>/dev/null || true; fi; rm -rf -- "$fixture"; exit "$status"' EXIT
mkdir -p "$fixture/bin" "$fixture/source/apps/api/app/services" "$fixture/source/scripts"
touch "$fixture/source/docker-compose.yml" "$fixture/source/docker-compose.production.yml" \
  "$fixture/source/docker-compose.domain.yml" "$fixture/source/docker-compose.static-cache.yml" "$fixture/source/apps/api/app/services/alerts.py"
tar -czf "$fixture/source.tar.gz" -C "$fixture/source" .
export FIXTURE_ARCHIVE="$fixture/source.tar.gz"
export TARGET_SHA=1111111111111111111111111111111111111111
cat > "$fixture/bin/git" <<'MOCK'
#!/bin/bash
printf '%s\trefs/heads/main\n' "$TARGET_SHA"
MOCK
cat > "$fixture/bin/curl" <<'MOCK'
#!/bin/bash
if [[ $* == *tarball* ]]; then
 while [[ $# -gt 0 ]]; do
  if [[ $1 == -o ]]; then cp "$FIXTURE_ARCHIVE" "$2"; exit; fi
  shift
 done
 exit 1
fi
if [[ $* == *health/ready* ]]; then echo '{"status":"ready"}'; fi
MOCK
cat > "$fixture/bin/docker" <<'MOCK'
#!/bin/bash
if [[ $* == *'/app/retain-static.mjs'* ]]; then
 echo retain >> "$TRACE"
 [[ $SCENARIO != static_preflight ]] || exit 42
 echo '{"files":[]}'
elif [[ $* == *'/app/check-static.mjs'* ]]; then
 [[ $* == *--image-build* ]] || exit 45
 echo static_check >> "$TRACE"
 [[ $SCENARIO != static_postflight ]] || exit 43
 echo '{"checked":1}'
elif [[ $1 == cp ]]; then
 echo capture >> "$TRACE"
elif [[ $* == *'config --services'* ]]; then
 if [[ $SCENARIO == services ]]; then exit 255; fi
 # An early-closing consumer would break this producer under pipefail.
 trap 'exit 255' PIPE
 printf 'events-worker\n'
 sleep 0.05
 for ((i=0;i<2000;i++)); do printf 'service-%s\n' "$i" || exit 255; done
 printf 'producer-finished\n' || exit 255
elif [[ $* == *inspect* ]]; then
 echo fixture-image
elif [[ $* == *pg_dump* ]]; then
 echo fixture-database-dump
elif [[ $* == *pg_restore* ]]; then
 cat >/dev/null
elif [[ $* == *' stop '* ]]; then
 echo stop >> "$TRACE"
elif [[ $* == *' up '* ]]; then
 [[ $* == *docker-compose.static-cache.yml* ]] || exit 44
 echo up >> "$TRACE"
fi
MOCK
cat > "$fixture/bin/systemd-run" <<'MOCK'
#!/bin/bash
[[ $* == *--check-only* && $* == *EnvironmentFile=/etc/hoptrip/monitor.env* ]] || exit 8
count=0
if [[ -f $COUNTER ]]; then count=$(cat "$COUNTER"); fi
count=$((count+1))
echo "$count" > "$COUNTER"
if [[ $SCENARIO == preflight && $count == 1 ]] || [[ $SCENARIO == postflight && $count == 2 ]]; then
 echo '{"checks":{"website":true,"api":true,"pipeline":false}}'
 exit 1
fi
echo '{"checks":{"website":true,"api":true,"pipeline":true,"events_pipeline":true}}'
MOCK
chmod +x "$fixture/bin/"*
export PATH="$fixture/bin:$PATH"
export SCENARIO=success TRACE="$fixture/probe.trace" COUNTER="$fixture/probe.count"
status=0
docker compose config --services 2>/dev/null | grep -qx events-worker || status=$?
[[ $status == 255 ]]
echo 'early-closing consumer: reproduced producer exit 255'
for scenario in success services preflight postflight static_preflight static_postflight; do
 export SCENARIO=$scenario TRACE="$fixture/$scenario.trace" COUNTER="$fixture/$scenario.count"
 target="$fixture/$scenario-root"
 mkdir -p "$target/previous"
 touch "$target/previous/docker-compose.yml"
 echo EVENTS_SYNC_ENABLED=true > "$target/.env.production"
 echo 0000000000000000000000000000000000000000 > "$target/deployed-sha"
 ln -s "$target/previous" "$target/current"
 sed "s|^root=/opt/hoptrip$|root=$target|" "$repository/scripts/deploy-production.sh" > "$fixture/deploy.sh"
 # The production root-user guard is unrelated to these isolated filesystem tests.
 # Match the literal variable in the production script.
 # shellcheck disable=SC2016
 sed -i '/^\[\[ \$EUID == 0 \]\]/d' "$fixture/deploy.sh"
 status=0
 bash_flags=()
 if [[ ${DEPLOY_TEST_TRACE:-0} == 1 ]]; then bash_flags=(-x); fi
 bash "${bash_flags[@]}" "$fixture/deploy.sh" "$TARGET_SHA" > "$fixture/$scenario.log" 2>&1 || status=$?
 if [[ $scenario == success ]]; then
  [[ $status == 0 && $(cat "$target/deployed-sha") == "$TARGET_SHA" ]]
  grep -q producer-finished "$target"/backups/*/services.txt
  test -s "$target"/backups/*/postflight-checks.json
  test -s "$target"/backups/*/static-checks.json
  grep -qx retain "$TRACE"
  grep -qx static_check "$TRACE"
 else
  [[ $status != 0 && $(cat "$target/deployed-sha") == 0000000000000000000000000000000000000000 ]]
  case $scenario in
   services) grep -q 'stage=validate-compose.*status=255' "$fixture/$scenario.log" ;;
   preflight) grep -q 'stage=monitor-preflight' "$fixture/$scenario.log" ;;
   postflight) grep -q 'stage=monitor-postflight' "$fixture/$scenario.log" ;;
   static_preflight) grep -q 'stage=preserve-static.*status=42' "$fixture/$scenario.log" ;;
   static_postflight) grep -q 'stage=static-postflight.*status=43' "$fixture/$scenario.log" ;;
  esac
  if [[ $scenario != postflight && $scenario != static_postflight ]]; then
   if grep -q stop "$TRACE" 2>/dev/null; then exit 1; fi
  else
   [[ $(grep -c up "$TRACE") == 2 ]]
  fi
 fi
 echo "$scenario: passed"
done
