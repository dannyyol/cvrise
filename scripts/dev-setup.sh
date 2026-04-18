#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is not installed." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: docker compose is not available." >&2
  exit 1
fi

if [[ ! -f "server/.env" ]]; then
  if [[ -f "server/env.example" ]]; then
    cp "server/env.example" "server/.env"
    echo "Created server/.env from server/env.example"
  else
    echo "Error: server/.env is missing and server/env.example was not found." >&2
    exit 1
  fi
fi

if [[ ! -f "client/.env" ]]; then
  cat > "client/.env" <<'EOF'
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=CVRise
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
  echo "Created client/.env with safe local defaults"
fi

echo "Starting MySQL container..."
docker compose --profile dev up -d db

echo "Waiting for MySQL to become healthy..."
READY=0
for _ in {1..60}; do
  if docker compose exec -T db sh -lc 'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 2
done

if [[ "$READY" -ne 1 ]]; then
  echo "Error: MySQL did not become ready in time." >&2
  exit 1
fi

echo "Ensuring application database exists..."
docker compose exec -T db sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\`;"'

echo "Running migrations and seeders..."
docker compose --profile dev run --rm server-init

echo "Starting API and frontend..."
docker compose --profile dev up -d server-dev client-dev

echo
echo "Setup complete:"
echo "- Frontend: http://localhost:3000"
