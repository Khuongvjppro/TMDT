# Frontend App

Next.js 15 + TypeScript + Tailwind CSS

## 1) Purpose

Frontend provides the starter user interface for job browsing and basic employer posting flow.

## 2) Environment

Create `frontend/.env.local` from `.env.example`.

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## 3) Local run (inside frontend)

```powershell
Set-Location "g:\Nguyen Tuan Khuong\25-26\HKII\TMDT\frontend"

npm install
npm run dev
```

## 4) Main pages

- `/`: job list with search filters
- `/login`: login page (includes quick login buttons for seed users)
- `/jobs/[id]`: job detail page with quick-apply form connected to backend
- `/employer/jobs/new`: create job form (allowed for EMPLOYER, ADMIN)
- `/admin/users`: admin user-role management screen (allowed for ADMIN)

## 5) Integration notes

- All API calls use `NEXT_PUBLIC_API_BASE_URL`.
- Backend must be running at `http://localhost:4000` by default.
- If backend URL/port changes, update `.env.local`.

## 6) Scripts

- `npm run dev`: start development server
- `npm run build`: production build
- `npm run start`: run production build
- `npm run lint`: run Next.js lint

## 7) Typical test flow

1. Open home page and verify jobs are visible.
2. Open `/login` and quick-login as each role account.
3. Open one job detail page and test apply permission by role.
4. Open `/employer/jobs/new` and verify create-job permission by role.
5. Open `/admin/users` and verify only ADMIN can list/update roles.

## 8) Current scope

This is still a starter UI scaffold. Session is stored in browser localStorage for manual testing purposes.
