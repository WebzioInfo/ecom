# Multi-Tenant Ecommerce Platform

A clean, developer-friendly project with independent `frontend` and `backend` applications.

---

## 📁 Repository Layout

```
.
├── backend/                  # NestJS Multi-Tenant Engine & API Server
│   ├── src/                  # Application Source Code
│   ├── prisma/               # Public & Tenant Prisma Schemas
│   ├── package.json          # Backend Dependencies
│   └── package-lock.json     # Lockfile
└── frontend/                 # React 19 + Vite Frontend SPA
    ├── src/                  # React Source Code
    ├── package.json          # Frontend Dependencies
    └── package-lock.json     # Lockfile
```

---

## 🚀 Development Workflow

### 1. Backend Setup

```bash
cd backend
npm install           # Installs dependencies & generates Prisma clients
npm run start:dev     # Starts NestJS dev server on port 4001
```

- **API Base URL**: `http://localhost:4001/api/v1`
- **Swagger Docs**: `http://localhost:4001/api/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install           # Installs dependencies
npm run dev           # Starts Vite dev server on port 3000
```

- **Frontend URL**: `http://localhost:3000`

---

## 🛠️ Common Commands

### Backend Commands
- `npm run start:dev`: Run NestJS backend in watch mode
- `npm run build`: Compile TypeScript code to `dist/main.js`
- `npm test`: Run backend tests
- `npm run lint`: Run ESLint checks

### Frontend Commands
- `npm run dev`: Run Vite development server
- `npm run build`: Type-check and build production SPA bundle
- `npm run preview`: Preview production build locally
