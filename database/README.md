# Database Guide

This project supports two database workflows:

- Primary: XAMPP MySQL + phpMyAdmin
- Optional: Docker MySQL container

## 1) XAMPP workflow (recommended)

1. Open XAMPP Control Panel.
2. Start MySQL service.
3. Open `http://localhost/phpmyadmin`.
4. Create database: `job_platform`.
5. Ensure app env uses:
   - `DATABASE_URL=mysql://root:@localhost:3306/job_platform`

## 2) Docker workflow (optional)

From workspace root:

```powershell
docker compose -f database/docker-compose.yml up -d
```

If using Docker, update `DATABASE_URL` in root `.env` and `backend/.env` to match Docker user/password/port.

## 3) Initialize tables and seed data

From workspace root:

```powershell
npm run prisma:generate -w backend
npm run prisma:migrate -w backend -- --name init
npm run prisma:seed -w backend
```

## 4) Verify seeded data

```powershell
Set-Location backend
npx ts-node scripts/check-data.ts
```

You should see non-zero counts for users/jobs and role profile tables.
