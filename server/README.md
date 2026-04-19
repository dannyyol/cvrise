# CVRise Server

FastAPI backend for CVRise.

## What It Provides
- REST API under `API_PREFIX` (default: `/api`)
- Auth, resumes, cover letters, templates, billing, settings
- Database migrations via Alembic
- Seed data via the built-in CLI
- PDF export via Playwright (Chromium)

## Quick Start (Docker)

From the repo root:
```bash
make dev
```

API docs: http://localhost:8000/docs

## Local Setup (No Docker)

### Prerequisites
- Python 3.12+
- A MySQL database

### Environment
```bash
cp env.example .env
```

Set at least:
- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `CLIENT_BASE_URL`

If you run MySQL via the repo's compose file, it is exposed on `127.0.0.1:3307`:
`DATABASE_URL=mysql+aiomysql://cvrise:cvrise@127.0.0.1:3307/cvrise`

### Install dependencies
```bash
python -m pip install -r requirements.txt
python -m playwright install chromium
```

### Migrate + seed
```bash
alembic upgrade heads
python -m src.cli seed
```

### Run the API
```bash
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

## CLI

Run from `server/`:
- Seed: `python -m src.cli seed`
- Seed one seeder: `python -m src.cli seed templates`
- Refresh DB (drop + migrate + seed): `python -m src.cli refresh`

## Tests
```bash
python -m pytest tests -q
python -m compileall src
```
