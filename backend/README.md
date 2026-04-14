# Backend Service

Node.js + Express + TypeScript + Prisma + MySQL

## 1) Purpose

Backend provides REST APIs for authentication, roles, jobs, applications, and basic admin operations.

## 2) Folder overview

```text
backend/
   prisma/
      schema.prisma
      seed.ts
   scripts/
      check-data.ts
   src/
      constants/
      controllers/
      lib/
      middleware/
      routes/
      services/
      server.ts
```

## 3) Environment

Create `backend/.env` from `.env.example`.

Example:

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=replace_with_secure_secret
DATABASE_URL=mysql://root:@localhost:3306/job_platform
```

## 4) Local run (inside backend)

```powershell
Set-Location "g:\Nguyen Tuan Khuong\25-26\HKII\TMDT\backend"

npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

## 5) API base

- Base URL: `http://localhost:4000`
- Prefix: `/api`

## 6) Endpoint summary

- Health:
  - `GET /api/health`
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (Bearer token)
- Jobs:
  - `GET /api/jobs`
  - `GET /api/jobs/:id`
  - `POST /api/jobs` (EMPLOYER, ADMIN)
  - `PATCH /api/jobs/:id` (Owner EMPLOYER or ADMIN)
  - `DELETE /api/jobs/:id` (Owner EMPLOYER or ADMIN)
- Applications:
  - `POST /api/applications/jobs/:jobId` (CANDIDATE, ADMIN)
  - `GET /api/applications/me` (CANDIDATE, ADMIN)
- Admin:
  - `GET /api/admin/users` (ADMIN)
  - `PATCH /api/admin/users/:id/role` (ADMIN)

## 7) Roles and data model notes

- Roles: GUEST, CANDIDATE, EMPLOYER, ADMIN
- Profile tables:
  - `CandidateProfile`
  - `EmployerProfile`
  - `AdminProfile`
- `Job` belongs to employer user.
- `Application` has unique key `(candidateId, jobId)`.

## 8) Seed accounts

- guest@demo.com / 123456
- candidate@demo.com / 123456
- employer@demo.com / 123456
- admin@demo.com / 123456

## 9) Useful scripts

- `npm run dev`: run server with hot reload
- `npm run build`: compile TypeScript
- `npm run start`: run compiled server
- `npm run prisma:generate`
- `npm run prisma:migrate -- --name <name>`
- `npm run prisma:seed`
- `npx ts-node scripts/check-data.ts`: print table counts

## 10) Troubleshooting

- Prisma cannot find env variable:
  - Ensure `backend/.env` exists.
- Database connection refused:
  - Ensure XAMPP MySQL is running.
  - Check host/port/user/password in `DATABASE_URL`.
- JWT errors:
  - Ensure `JWT_SECRET` is set consistently.
