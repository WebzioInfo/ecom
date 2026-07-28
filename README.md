# Enterprise Multi-Tenant Ecommerce Platform

This repository is structured as an **independent frontend and backend monorepo architecture**. 
Each service manages its own dependencies (`package.json`, `package-lock.json`, and `node_modules`) independently, allowing isolated deployment, independent CI/CD pipelines, and zero shared module leaking.

---

## 📁 Repository Layout

```
.
├── backend/                  # NestJS Multi-Tenant Engine & API Server
│   ├── src/                  # Application Source Code
│   ├── prisma/               # Public & Tenant Prisma Schemas + Migrations
│   ├── Dockerfile            # Production Multi-stage Dockerfile
│   ├── package.json          # Independent Backend Dependencies
│   └── package-lock.json     # Deterministic Lockfile
├── frontend/                 # React 19 + Vite Frontend SPA Application
│   ├── src/                  # React Source Code
│   ├── Dockerfile            # Production Nginx SPA Container
│   ├── package.json          # Independent Frontend Dependencies
│   └── package-lock.json     # Deterministic Lockfile
├── .github/
│   └── workflows/
│       └── ci.yml            # Independent CI Audit Pipelines
├── docker-compose.yml        # Orchestration for Postgres, Backend, & Frontend
└── railway.toml              # Production Deployment Specs
```

---

## 🚀 Quick Start

### 1. Local Development (Backend)

```bash
cd backend
npm install           # Installs dependencies & triggers Prisma client generation
npm run start:dev     # Starts NestJS server in watch mode on port 4001
```

### 2. Local Development (Frontend)

```bash
cd frontend
npm install           # Installs dependencies
npm run dev           # Starts Vite dev server on port 3000
```

### 3. Docker Compose Orchestration

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **PostgreSQL**: `localhost:5432`

---

## 🛠️ Verification & Scripts

### Backend Commands
- `npm run build`: Compiles TypeScript cleanly to `dist/main.js`.
- `npm run start:prod`: Runs production bundle from `dist/main.js`.
- `npm test`: Runs backend test suite.
- `npm run postinstall`: Generates both public and tenant Prisma clients.

### Frontend Commands
- `npm run build`: Type-checks with `tsc` and builds Vite SPA assets into `dist/`.
- `npm run preview`: Previews production SPA build locally.
