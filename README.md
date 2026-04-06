## Features

### Core Features
- **Professional Templates** - Choose from multiple ATS-friendly CV templates
- **AI-Powered Review** - Get intelligent feedback on your CV content and structure
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Privacy First** - Your data stays with you - no tracking, no data collection
- **Multiple Export Formats** - Download as PDF or DOC format
- **ATS Optimization** - Built-in ATS compatibility analysis
- **Customizable** - Accent colors and template variations

### Technical Features
- **100% Open Source** - AGPLv3 licensed, community-driven development
- **Legacy Tech Stack** - React 18, TypeScript, Tailwind CSS, FastAPI
- **Real-time Preview** - See changes instantly as you type
- **Drag & Drop Sections** - Reorder CV sections with ease
- **Self-hostable** - Deploy on your own infrastructure

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.13 or higher)
- **pnpm** (recommended) or **npm** or **yarn**
- **Ollama** (for AI review functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dannyyol/cvforge.git
   cd cvforge
   ```

2. **Install and set up Ollama (for AI review functionality)**
   
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

3. **Set up the frontend (Client)**
   ```bash
   cd client
   pnpm install
   # or
   npm install
   ```

4. **Set up the backend (Server)**
   ```bash
   cd ../server
   pip install -r requirements.txt
   ```

   Install Playwright browsers (for PDF export)
   ```bash
   # macOS / Windows / Linux (generic)
   python -m playwright install chromium

   # Linux only: install required system dependencies
   # (run with sudo if prompted)
   playwright install-deps
   ```

5. **Configure environment variables**
   ```bash
   # In the server directory
   cp env.example .env
   # Edit .env with your preferred settings
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   python -m uvicorn src.main:app --reload
   ```

2. **Start the frontend development server**
   ```bash
   cd client
   pnpm dev
   # or
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` to start building your CV!

## Generating Thumbnails

CVForge includes a thumbnail generation system for template previews. Here's how to generate thumbnails:

### Prerequisites for Thumbnail Generation
- Ensure both frontend and backend servers are running
- The application should be accessible at `http://localhost:5173`

### Generate Thumbnails

1. **Make sure the development server is running**
   ```bash
   cd client
   pnpm dev
   ```

2. **Run the thumbnail generation script**
   ```bash
   cd client
   pnpm generate-thumbnails
   ```

### Thumbnail Generation Process

The thumbnail generation script:
- Uses Puppeteer to take screenshots of each template
- Generates thumbnails at 400x500 resolution
- Saves thumbnails to `client/public/thumbnails/`
- Supports templates: classic, legacy, professional

### Customizing Thumbnail Generation

You can customize the thumbnail generation by modifying `client/scripts/generate-thumbnails.mjs`:

```javascript
// Customize viewport and thumbnail dimensions
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 1000;

```

## Usage Guide

### Building Your CV

1. **Personal Details** - Add your contact information and photo
2. **Professional Summary** - Write a compelling summary of your experience
3. **Work Experience** - Add your employment history with achievements
4. **Education** - Include your educational background
5. **Skills** - List your technical and soft skills
6. **Projects** - Showcase your notable projects
7. **Certifications** - Add relevant certifications and awards

### AI Review Feature

The AI Review feature provides:
- **Overall Score** - Comprehensive CV rating (0-100)
- **ATS Compatibility** - How well your CV works with applicant tracking systems
- **Content Quality** - Analysis of your CV content and structure
- **Section-by-Section Feedback** - Detailed suggestions for each section
- **Strengths & Improvements** - What's working well and what needs work

### Customization

- **Templates** - Choose from multiple professional templates
- **Accent Colors** - Customize the color scheme (template dependent)
- **Section Ordering** - Drag and drop to reorder CV sections
- **Content Formatting** - Rich text editing for descriptions

## License

CVForge is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

### What this means:

- **Free and Open Source** - You can use, modify, and distribute CVForge freely
- **Commercial use allowed** - You can use CVForge in your business
- **Modification allowed** - You can modify the source code to suit your needs
- **Distribution allowed** - You can distribute original or modified versions
- **Copyleft requirement** - Any modifications must also be licensed under AGPLv3
- **Network copyleft** - If you run a modified version as a web service, you must provide the source code to users

### Key Requirements:

- **Source code disclosure** - If you distribute the software or run it as a web service, you must make the source code available
- **Same license** - Any derivative works must be licensed under AGPLv3
- **Copyright notices** - You must preserve all copyright and license notices
- **Network provision** - Users of your web service must be able to download the source code

### Why AGPLv3?

The AGPL ensures that CVForge remains free and open source, even when used as a web service. This prevents proprietary forks and ensures that improvements benefit the entire community.

### Learn More About AGPLv3:

- **Official License Text**: [GNU AGPL v3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- **License Guide**: [Choose a License - AGPL-3.0](https://choosealicense.com/licenses/agpl-3.0/)
- **FSF Explanation**: [Why the Affero GPL](https://www.gnu.org/licenses/why-affero-gpl.html)
- **License Comparison**: [GPL vs AGPL vs LGPL](https://www.gnu.org/licenses/gpl-faq.html#WhatDoesGPLStandFor)
- **Practical Guide**: [Understanding AGPL](https://copyleft.org/guide/comprehensive-gpl-guidech12.html)

For the full license text, see the [LICENSE](LICENSE) file in this repository.
