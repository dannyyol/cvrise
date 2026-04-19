# CVRise

CVRise is an open-source resume + cover letter builder with a real-time editor, template-based previews, PDF export, and AI-powered workflows.

**Stack**
- **Client**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Server**: FastAPI + SQLAlchemy + Alembic + MySQL
- **AI (optional)**: Ollama (self-hosted) and/or API keys for providers configured on the server

## Quick Start (Recommended: Docker)

### Prerequisites
- Docker + Docker Compose
- Make (optional, but recommended)

### Start everything
```bash
git clone https://github.com/dannyyol/cvrise.git
cd cvrise
make dev
```

**URLs**
- App: http://localhost:3000
- API docs: http://localhost:8000/docs

## Local Development (No Docker)

### Prerequisites
- Node.js >= 20.9 (see [client/package.json](client/package.json))
- pnpm (recommended) or npm
- Python 3.12+
- A MySQL database

### Setup
```bash
cp server/env.example server/.env
cp client/env.example client/.env
```

Update `server/.env` to point to your MySQL instance.

If you want to run only MySQL via Docker:
```bash
docker compose --profile dev up -d db
```

Then set:
`DATABASE_URL=mysql+aiomysql://cvrise:cvrise@127.0.0.1:3307/cvrise`

### Run the server
```bash
cd server
python -m pip install -r requirements.txt
alembic upgrade heads
python -m src.cli seed
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

### Run the client
```bash
cd client
pnpm install
pnpm dev
```

## Useful Commands

### Client (Next.js)
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Build: `pnpm build`

### Server (FastAPI)
- Run tests: `python -m pytest tests -q`
- Compile check: `python -m compileall src`
- Seed DB: `python -m src.cli seed`
- Refresh DB (drop + migrate + seed): `python -m src.cli refresh`

## Environment Variables

Copy examples and adjust as needed:
- Server: [server/env.example](server/env.example)
- Client: [client/env.example](client/env.example)

## Docs

- Development: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- Self-hosting: [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md)

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

Licensed under the GNU Affero General Public License v3.0 (AGPLv3). See [LICENSE](LICENSE).
