# Contributing to CVForge

Thank you for your interest in contributing to CVForge! This guide will help you get started with the development environment and contribution process.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.13 or higher)
- **pnpm** (recommended) or **npm** or **yarn**
- **Ollama** (for AI review functionality)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally**
   ```bash
   git clone https://github.com/dannyyol/cvforge.git
   cd cvforge
   ```

## Development Setup

### 1. Install and Set Up Ollama

Ollama is required for the AI review functionality.

**macOS:**
```bash
# Download and install from https://ollama.ai
# Or using Homebrew:
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
```bash
# Download installer from https://ollama.ai
```

**Start Ollama and pull a model:**
```bash
# Start Ollama service
ollama serve

```

### 2. Set Up the Frontend (Client)

```bash
cd client
pnpm install
# or
npm install
```

### 3. Set Up the Backend (Server)

```bash
cd ../server
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# In the server directory
cp env.example .env
# Edit .env with your preferred settings
```

### 5. Running the Application

**Start the backend server:**
```bash
cd server
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

**Start the frontend development server:**
```bash
cd client
pnpm dev
```

**Open your browser:**
Navigate to `http://localhost:5173` to start developing!

### 6. Generating Thumbnails (Optional)

CVForge includes a thumbnail generation system for template previews:

**Prerequisites:**
- Ensure both frontend and backend servers are running
- The application should be accessible at `http://localhost:5173`

**Generate thumbnails:**
```bash
cd client
pnpm generate-thumbnails
```

The script will:
- Use Puppeteer to take screenshots of each template
- Generate thumbnails at 400x500 resolution
- Save thumbnails to `client/public/thumbnails/`
- Support templates: classic, legacy, professional

## How to Contribute

### Development Workflow

1. **Create a new branch** for your feature or bug fix:
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

- **Frontend**: Follow TypeScript and React best practices
- **Backend**: Follow Python PEP 8 style guidelines
- **Commits**: Use conventional commit messages (feat, fix, docs, style, refactor, test, chore)

### Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation if necessary
3. Add tests for new functionality
4. Update the README.md if you've added new features
5. Request review from maintainers

### Areas for Contribution

- **Beginner**: CV template design, documentation improvements
- **Intermediate**: Frontend components, UI/UX enhancements
- **Advanced**: Backend architecture, AI integration, testing

### Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues and discussions before creating new ones
