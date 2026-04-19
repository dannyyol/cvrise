# Contributing to CVRise

Thank you for your interest in contributing to CVRise! This guide covers local setup, workflows, and expectations for pull requests.

## Getting Started

### Prerequisites (Recommended)

Before you begin, ensure you have the following installed:

- Docker + Docker Compose
- Make (optional)

### Prerequisites (No Docker)
- Node.js >= 20.9
- pnpm (recommended) or npm
- Python 3.12+
- A MySQL database

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally**
   ```bash
   git clone https://github.com/dannyyol/cvrise.git
   cd cvrise
   ```

## Development Setup

### Option A: Docker (Recommended)

From the repo root:
```bash
make dev
```

URLs:
- App: http://localhost:3000
- API docs: http://localhost:8000/docs

### Option B: No Docker

1) Create env files:
```bash
cp server/env.example server/.env
cp client/env.example client/.env
```

2) Server:
```bash
cd server
python -m pip install -r requirements.txt
python -m playwright install chromium
alembic upgrade heads
python -m src.cli seed
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

3) Client:
```bash
cd client
pnpm install
pnpm dev
```

## How to Contribute

### Development Workflow

1. **Create a new branch** for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with a clear commit message:
   ```bash
   git commit -m "feat: add new CV template"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Coding Standards

- Keep changes focused and readable.
- Prefer existing patterns/utilities in the codebase.
- Commits: use conventional commit prefixes (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).

### Before Opening a PR

Run the checks that CI runs:
- Client (from `client/`):
  - `pnpm run lint`
  - `pnpm exec tsc -p tsconfig.json --noEmit`
  - `pnpm run test`
  - `pnpm run build`
- Server (from `server/`):
  - `python -m compileall src`
  - `python -m pytest tests -q`

### Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation if necessary
3. Add tests for new functionality
4. Update the README.md if you've added new features
5. Request review from maintainers

### Areas for Contribution

- **Beginner**: Template tweaks, documentation improvements
- **Intermediate**: Frontend components, UI/UX enhancements
- **Advanced**: Backend architecture, AI integration, testing

### Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues and discussions before creating new ones
