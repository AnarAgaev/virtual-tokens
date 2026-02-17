# 🔮 Virtual Tokens

A modern web application for automatically generating virtual tokens from electrical appliance part numbers.

## 🚀 Technologies Used

| Technology        | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| ⚡ **Vite**       | Fast build tool and development server                 |
| ⚛️ **React**      | Modern UI library for building user interfaces         |
| 📘 **TypeScript** | Type-safe JavaScript for better development experience |
| 🐻 **Zustand**    | Lightweight state management solution                  |
| 🛡️ **Zod**        | Schema validation and TypeScript-first type inference  |
| 🎨 **Chakra UI**  | Accessible and modular component library               |
| 🔧 **Biome**      | Fast formatter and linter for web projects             |

## ✨ Features

- 🎯 **Automatic Token Generation** - Convert part numbers to virtual tokens seamlessly
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Beautiful UI** - Clean and modern interface powered by Chakra UI
- 🔒 **Type Safety** - Full TypeScript support with Zod validation
- ⚡ **Blazing Fast** - Optimized performance with Vite
- 🧩 **Modular Architecture** - Well-structured and maintainable codebase

## 🛠️ Development

### Prerequisites

- **Node.js** (version 23.10.0 or higher)
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** (for containerized development)

### Local Installation

```bash
# Clone the repository
git clone <repository-url>
cd virtual-tokens

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🐳 Docker Development

The project uses Docker with multi-stage builds and profiles for different scenarios.

### Docker Files Structure

- **`Dockerfile`** - Production build stage (creates optimized dist folder)
- **`Dockerfile.dev`** - Development environment with hot-reload for Vite
- **`.dockerignore`** - Excludes unnecessary files from Docker context
- **`docker-compose.yml`** - Orchestrates containers with profile support

### Quick Start with Docker

#### 1️⃣ Development Mode (with hot-reload)

```bash
# Start Vite dev server with live reload
docker compose --profile dev up --build
```

App will be available at **http://localhost:5173**

**This mode:**

- Mounts your local files for instant updates
- Enables polling for hot-reload to work properly
- Perfect for active development without Node.js installed locally

#### 2️⃣ Production Build (for CI/CD testing)

```bash
# Generate production-ready dist folder
docker compose --profile build up --build
```

The `dist` folder will appear in your local project directory.

**This mode:**

- Creates an optimized production build
- Exports the `dist` folder to your local machine
- Ideal for testing the production bundle or CI/CD pipelines

#### 3️⃣ Stop Containers

```bash
# Stop and remove all running containers
docker compose down
```

## 🔄 CI/CD Integration

The build profile is designed to work seamlessly with CI/CD pipelines. The generated `dist` folder contains all static assets ready for deployment to any static hosting service.

## 📦 Project Structure

```
virtual-tokens/
├── src/               # Source code
├── public/            # Static assets
├── dist/              # Production build (generated)
├── docker-compose.yml # Docker composition
├── Dockerfile         # Production build stage
├── Dockerfile.dev     # Development environment
└── .dockerignore      # Docker exclusions
```
