#!/usr/bin/env bash
set -euo pipefail

slug="${1:-}"
if [[ -z "$slug" ]]; then
  echo "usage: init-run.sh <slug>" >&2
  exit 1
fi

base="/home/node/OpenClawBox/deliveries/website-clone-runs/$slug"
mkdir -p "$base/inspection" "$base/spec" "$base/implementation"

echo "$base"
