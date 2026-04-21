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
DATABASE_URL=mysql://root:@localhost:3306/job_platform

JWT_ACCESS_SECRET=replace_with_secure_access_secret
JWT_REFRESH_SECRET=replace_with_secure_refresh_secret
JWT_EMAIL_VERIFY_SECRET=replace_with_secure_email_verify_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_EMAIL_VERIFY_EXPIRES_IN=1h
FRONTEND_ORIGIN=http://localhost:3000

# Nodemailer SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
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
  - `POST /api/auth/verify-email`
  - `POST /api/auth/resend-verification`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
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
  - Ensure JWT secrets are set consistently: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_VERIFY_SECRET`.
