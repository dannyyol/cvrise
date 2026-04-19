# Self-Hosting

## Docker Compose (Production Profile)

The repository includes a production compose profile that runs:
- MySQL
- Ollama
- Server (FastAPI)
- Client (Next.js)

### 1) Create env files
```bash
cp server/env.example server/.env
cp client/env.example client/.env
```

Update the values as needed (especially secrets like Stripe keys).

### 2) Start services
```bash
docker compose --profile prod up -d
```

### 3) Upgrade images (GHCR)

Images are published as:
- `ghcr.io/dannyyol/cvrise-client`
- `ghcr.io/dannyyol/cvrise-server`

You can pin a tag via:
```bash
IMAGE_TAG=latest docker compose --profile prod up -d
```

## Notes

- The server runs migrations + seeders on container start.
- For custom domains / TLS termination, place a reverse proxy (Caddy / Nginx / Traefik) in front of `client` and `server`.

