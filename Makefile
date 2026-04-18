SHELL := /bin/bash

.PHONY: help dev up down refresh init doctor logs

help:
	@echo "Available targets:"
	@echo "  make dev       - First-time dev setup (db + migrations + seed + app)"
	@echo "  make up        - Start dev services"
	@echo "  make down      - Stop services"
	@echo "  make refresh  - Wipe volume and re-run setup"
	@echo "  make init      - Re-run migrations and seeders"
	@echo "  make logs      - Tail server/client logs"
	@echo "  make doctor    - Check docker and env prerequisites"

dev:
	@bash ./scripts/dev-setup.sh

up:
	@docker compose --profile dev up -d server-dev client-dev

down:
	@docker compose down

refresh:
	@docker compose down -v
	@bash ./scripts/dev-setup.sh

init:
	@docker compose --profile dev up -d db
	@docker compose --profile dev run --rm server-init

logs:
	@docker compose logs -f --tail=100 server-dev client-dev

doctor:
	@command -v docker >/dev/null 2>&1 || (echo "docker is not installed" && exit 1)
	@docker compose version >/dev/null 2>&1 || (echo "docker compose is not available" && exit 1)
	@test -f server/.env || echo "warning: server/.env is missing (will be auto-created by make dev)"
	@test -f client/.env || echo "warning: client/.env is missing (will be auto-created by make dev)"
	@echo "doctor checks passed"
