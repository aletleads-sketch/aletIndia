#!/usr/bin/env bash
# Deploy the ALET India Next.js app to https://all-deliveries.com/aletindia
# This script only updates /var/www/aletindia and restarts the aletindia service.
# It does not change the Laravel app in /var/www/all-deliveries.
set -euo pipefail

HOST="${DEPLOY_HOST:-ubuntu@13.62.47.220}"
PEM="${PEM_PATH:-$HOME/Documents/all_deliveries.pem}"
REMOTE_DIR="/var/www/aletindia"
SERVICE="aletindia"
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -f "$PEM" ]]; then
  echo "PEM file not found: $PEM" >&2
  exit 1
fi

SSH=(ssh -i "$PEM" -o StrictHostKeyChecking=accept-new)

echo "Syncing project to ${HOST}:${REMOTE_DIR}"
"${SSH[@]}" "$HOST" "mkdir -p '$REMOTE_DIR'"

rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude '*.pem' \
  -e "ssh -i ${PEM} -o StrictHostKeyChecking=accept-new" \
  "${ROOT}/" "${HOST}:${REMOTE_DIR}/"

echo "Installing dependencies and building on the server"
"${SSH[@]}" "$HOST" "cd '$REMOTE_DIR' && npm ci && NODE_OPTIONS='--max-old-space-size=1536' npm run build && sudo systemctl restart '$SERVICE' && sudo systemctl is-active '$SERVICE'"

echo "Deployed. Check https://all-deliveries.com/aletindia"
