# Development

## Repo Layout
- `client/`: Next.js app (UI)
- `server/`: FastAPI app (API)
- `docker-compose.yml`: Dev + prod containers (MySQL + Ollama + app services)
- `Makefile`: Convenience targets for Docker-based development

## Docker Development (Recommended)

From the repo root:
```bash
make dev
```

This will:
- Create `server/.env` and `client/.env` if missing
- Start MySQL + Ollama
- Run Alembic migrations and seeders
- Start API and Next.js dev servers

URLs:
- App: http://localhost:3000
- API docs: http://localhost:8000/docs

### Useful Make targets
- `make up`: start dev services
- `make down`: stop everything
- `make refresh`: wipe volumes, re-run migrations/seeders
- `make logs`: tail dev logs
- `make doctor`: validate Docker + env presence

## Local Development (No Docker)

### 1) Environment files
```bash
cp server/env.example server/.env
cp client/env.example client/.env
```

### 2) Database

Provide a MySQL database and set `DATABASE_URL` in `server/.env`.

If you want to run only MySQL via Docker:
```bash
docker compose --profile dev up -d db
```

Use:
`DATABASE_URL=mysql+aiomysql://cvrise:cvrise@127.0.0.1:3307/cvrise`

### 3) Server
```bash
cd server
python -m pip install -r requirements.txt
python -m playwright install chromium
alembic upgrade heads
python -m src.cli seed
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

### 4) Client
```bash
cd client
pnpm install
pnpm dev
```

## CI Parity

CI runs these checks:
- Client: lint, typecheck, tests, build
- Server: compile check + pytest

## Troubleshooting

### Docker setup fails
- Run `make doctor` to validate Docker + env presence.
- If MySQL never becomes healthy, confirm `MYSQL_ROOT_PASSWORD` is set in `server/.env`.
- If you changed DB credentials, also update `DATABASE_URL` accordingly.

### Ports already in use
- Client: 3000
- Server: 8000
- MySQL: 3307
- Ollama: 11434

Stop conflicting services or update the compose file / env values.

### Reset everything
```bash
make refresh
```
