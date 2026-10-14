#!/usr/bin/env bash
# Forced SSH command for the dedicated GitHub Actions key; no shell/SCP access.
set -euo pipefail
sha=${SSH_ORIGINAL_COMMAND:-}
[[ $sha =~ ^[0-9a-f]{40}$ ]] || { echo 'Expected a full commit SHA' >&2; exit 64; }
exec sudo -n /usr/local/sbin/hoptrip-deploy "$sha"
