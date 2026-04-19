# CVRise Client

Next.js (App Router) frontend for CVRise.

## Prerequisites
- Node.js >= 20.9
- pnpm (recommended) or npm

## Environment
```bash
cp env.example .env
```

Important variables:
- `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8000/api`)

## Development
```bash
pnpm install
pnpm dev
```

App runs on http://localhost:3000

## Scripts
- Generate template registries: `pnpm run generate:templates`
- Lint: `pnpm run lint`
- Test: `pnpm run test`
- Build: `pnpm run build`
- Start (prod): `pnpm run start`

## Notes
- Template registries are generated automatically via `predev` / `prebuild`.
