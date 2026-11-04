#!/usr/bin/env bash
# Deploy the ALET India Next.js app to https://aletindia.com
# This replaces the WordPress site on that domain. WordPress files stay on disk
# at /var/www/aletindia.com and are no longer served. Laravel at all-deliveries.com
# is not changed.
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

echo "Installing dependencies and building for https://aletindia.com"
"${SSH[@]}" "$HOST" "cd '$REMOTE_DIR' && npm ci && NEXT_PUBLIC_BASE_PATH= NEXT_PUBLIC_SITE_URL=https://aletindia.com NODE_OPTIONS='--max-old-space-size=1536' npm run build"

echo "Serving https://aletindia.com from the Next.js app"
"${SSH[@]}" "$HOST" 'cat > /tmp/aletindia-root.py' << 'PY'
from pathlib import Path

unit = """[Unit]
Description=ALET India Next.js site
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/aletindia
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_BASE_PATH=
Environment=NEXT_PUBLIC_SITE_URL=https://aletindia.com
ExecStart=/usr/bin/node /var/www/aletindia/node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3010
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
Path("/etc/systemd/system/aletindia.service").write_text(unit)

nginx_path = Path("/etc/nginx/sites-available/aletindia.com")
text = nginx_path.read_text()
proxy = """    client_max_body_size 32M;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
"""
old = """    root /var/www/aletindia.com;
    index index.php;

    client_max_body_size 900M;


    location ^~ /aletindia {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
    }

    location ~ /\\.ht {
        deny all;
    }
"""
if old in text:
    nginx_path.write_text(text.replace(old, proxy, 1))
    print("nginx now proxies aletindia.com to Next.js")
elif "proxy_pass http://127.0.0.1:3010;" in text and "fastcgi_pass" not in text:
    print("nginx already serves Next.js at the domain root")
else:
    raise SystemExit("aletindia.com nginx was not in a known layout; left it unchanged")
PY
"${SSH[@]}" "$HOST" "sudo python3 /tmp/aletindia-root.py && rm -f /tmp/aletindia-root.py && sudo nginx -t && sudo systemctl daemon-reload && sudo systemctl restart '$SERVICE' && sudo systemctl is-active '$SERVICE' && sudo nginx -s reload"

echo "Deployed. Check https://aletindia.com"
