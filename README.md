# Job Platform Monorepo

Starter project for a job portal platform with clear backend/frontend/database separation.

## 1) Tech stack

- Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Database: MySQL (XAMPP/phpMyAdmin recommended), Docker option included

## 2) Project structure

```text
TMDT/
   backend/
      prisma/
      src/
         constants/
         controllers/
         lib/
         middleware/
         routes/
        roles/
          guest.routes.ts
          candidate.routes.ts
          employer.routes.ts
          admin.routes.ts
         services/
         types/
   frontend/
      app/
      admin/
      candidate/
      employer/
      jobs/
      login/
      components/
      lib/
      types/
   database/
      docker-compose.yml
```

### Role-first organization (4 roles)

- `GUEST`: public pages + `auth` + public job browsing.
- `CANDIDATE`: candidate-only features (`/applications/me`, candidate frontend pages).
- `EMPLOYER`: employer-only features (`/employer/*`, employer frontend pages).
- `ADMIN`: admin-only features (`/admin/*`, admin frontend pages).

Backend keeps one API prefix (`/api`) and composes role routers inside `backend/src/routes/index.ts`.

## 3) Features included in this starter

- JWT authentication: register, login, current user
- Roles scaffold: GUEST, CANDIDATE, EMPLOYER, ADMIN
- Job listing, filtering, job detail
- Employer/Admin job CRUD
- Candidate/Admin application flow
- Admin basic user-role management

## 4) Prerequisites

- Node.js 20+
- npm 10+
- XAMPP (MySQL enabled)
- Optional: Docker Desktop (if you prefer MySQL container)

## 5) First-time setup (recommended: XAMPP)

1. Clone project and open terminal at workspace root.
2. Install dependencies.
3. Start MySQL in XAMPP.
4. Create database `job_platform` in phpMyAdmin (`http://localhost/phpmyadmin`).
5. Prepare env files.
6. Run Prisma generate/migrate/seed.
7. Start backend + frontend.

## 6) Commands (Windows PowerShell)

# Install dependencies

npm install

# Prepare env files

Copy-Item .env.example .env -Force
Copy-Item backend\.env.example backend\.env -Force
Copy-Item frontend\.env.example frontend\.env.local -Force

# Prisma (create tables + seed demo data)

npm run prisma:generate -w backend
npm run prisma:migrate -w backend -- --name init
npm run prisma:seed -w backend

# Run both apps

npm run dev

````

## 7) Commands (macOS/Linux)
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

npm install
npm run prisma:generate -w backend
npm run prisma:migrate -w backend -- --name init
npm run prisma:seed -w backend
npm run dev
````

## 8) Default URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health endpoint: http://localhost:4000/api/health

## 9) Seed accounts

- guest@demo.com / 123456
- candidate@demo.com / 123456
- employer@demo.com / 123456
- admin@demo.com / 123456

## 10) Useful scripts

- Root:
  - `npm run dev`: run backend + frontend
  - `npm run dev:backend`: run backend only
  - `npm run dev:frontend`: run frontend only
  - `npm run build`: build both workspaces
- Backend:
  - `npm run prisma:generate -w backend`
  - `npm run prisma:migrate -w backend -- --name <migration_name>`
  - `npm run prisma:seed -w backend`

## 11) Optional database with Docker

If XAMPP is not used:

```powershell
docker compose -f database/docker-compose.yml up -d
```

Then update `DATABASE_URL` in root `.env` and `backend/.env` to match Docker credentials/port.

## 12) Quick verification checklist

After setup, verify:

1. `GET /api/health` returns status ok.
2. Login works with one seed account.
3. Job list API returns seeded jobs.
4. Frontend home page shows job cards.

## 13) Common issues and fixes

- `P1012 Environment variable not found: DATABASE_URL`
  - Ensure `backend/.env` exists and includes `DATABASE_URL`.
- `Can't connect to MySQL`
  - Ensure XAMPP MySQL is running and DB name is `job_platform`.
  - Check host/port (`localhost:3306`) and credentials.
- Port already in use (3000 or 4000)
  - Stop old process or change `PORT` in env and update frontend API URL.

## 14) Scope note

This repository is an intentionally clean starter scaffold for team collaboration and incremental feature development.
