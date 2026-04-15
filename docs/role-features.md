# Role Features - Current Project Implementation

Tai lieu nay mo ta cac chuc nang theo tung role dang co trong project, bam dung code hien tai (backend + frontend).

## 1) Tong quan role

He thong co 4 role:

- GUEST
- CANDIDATE
- EMPLOYER
- ADMIN

Phan quyen duoc xu ly boi:

- `requireAuth`: bat buoc co Bearer token hop le
- `requireRole([...])`: gioi han truy cap theo role

Nguon:

- `backend/src/constants/enums.ts`
- `backend/src/middleware/auth.ts`
- `backend/prisma/schema.prisma`

## 2) Chuc nang chung (khong phu thuoc role dac biet)

### 2.1 Health check

- `GET /api/health`
- Moi nguoi deu goi duoc (khong can token)

### 2.2 Auth

- `POST /api/auth/register`
  - Dang ky duoc voi role `CANDIDATE` hoac `EMPLOYER`
  - Neu khong truyen role thi mac dinh `CANDIDATE`
- `POST /api/auth/login`
  - Dang nhap, tra ve JWT + thong tin user
- `GET /api/auth/me`
  - Can token, tra ve thong tin user hien tai

## 3) Role GUEST

GUEST o day bao gom:

- Nguoi chua dang nhap (khong co token)
- User co role `GUEST` trong he thong

### 3.1 Chuc nang duoc phep

- Xem danh sach jobs cong khai:
  - `GET /api/jobs`
- Xem chi tiet job:
  - `GET /api/jobs/:id`
- Tim kiem/filter job qua query:
  - `q`, `location`, `type`, `page`, `pageSize`

### 3.2 Chuc nang khong duoc phep

- Tao, sua, xoa job
- Apply vao job
- Xem danh sach application cua minh
- Quan tri users (admin)

### 3.3 Tren web UI

- Xem trang home va tim kiem job: `/`
- Xem trang chi tiet job: `/jobs/[id]`
- Neu chua login thi khong apply/khong thao tac role-protected duoc

## 4) Role CANDIDATE

### 4.1 Chuc nang duoc phep

- Ke thua toan bo quyen xem jobs cua GUEST
- Apply vao job dang active:
  - `POST /api/applications/jobs/:jobId`
- Xem danh sach don ung tuyen cua chinh minh:
  - `GET /api/applications/me`

### 4.2 Rang buoc nghiep vu

- Khong duoc apply trung cung 1 job (unique `(candidateId, jobId)`)
- Job khong ton tai hoac khong active thi khong apply duoc
- Payload apply hop le:
  - `coverLetter` toi da 2000 ky tu
  - `cvLink` neu co phai la URL hop le

### 4.3 Chuc nang khong duoc phep

- Tao/sua/xoa job
- Truy cap admin APIs

### 4.4 Tren web UI

- Dang nhap qua `/login`
- Apply truc tiep tai trang chi tiet job (`Quick Apply`)
- Neu dung role khac thi UI thong bao khong duoc phep

## 5) Role EMPLOYER

### 5.1 Chuc nang duoc phep

- Ke thua toan bo quyen xem jobs cua GUEST
- Tao job:
  - `POST /api/jobs`
- Sua job:
  - `PATCH /api/jobs/:id`
- Xoa job:
  - `DELETE /api/jobs/:id`

### 5.2 Rang buoc nghiep vu

- EMPLOYER chi duoc sua/xoa job do chinh minh tao
- Validate payload tao/sua job:
  - `title`, `companyName`, `location` co do dai toi thieu
  - `description`, `requirements` toi thieu 10 ky tu
  - `type` thuoc enum `JobType`
  - Neu co `salaryMin` va `salaryMax` thi phai dam bao `salaryMin <= salaryMax`

### 5.3 Chuc nang khong duoc phep

- Khong duoc goi admin APIs
- Khong duoc apply job theo route hien tai

### 5.4 Tren web UI

- Dang nhap qua `/login`
- Tao job tai:
  - `/employer/jobs/new`
  - `/recruiter/jobs/new` (alias tro den cung logic)
- UI tu dong chan neu role khong phai `EMPLOYER` hoac `ADMIN`

## 6) Role ADMIN

### 6.1 Chuc nang duoc phep

- Toan quyen quan tri users:
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:id/role`
- Co quyen tao/sua/xoa job nhu EMPLOYER
- Co quyen sua/xoa job cua bat ky employer nao (khong bi ownership check)
- Theo route hien tai, ADMIN cung co the:
  - apply vao job (`POST /api/applications/jobs/:jobId`)
  - xem applications cua minh (`GET /api/applications/me`)

### 6.2 Rang buoc dac biet

- Admin khong duoc tu bo role ADMIN cua chinh minh

### 6.3 Tren web UI

- Dang nhap qua `/login`
- Quan tri users tai `/admin/users`
- Doi role truc tiep tren bang users

## 7) Tu dong tao role profile

He thong tu dong dam bao profile theo role khi:

- Dang ky user moi
- Admin doi role user

Cac bang profile lien quan:

- `CandidateProfile`
- `EmployerProfile`
- `AdminProfile`

Xu ly o service:

- `backend/src/services/role-profile.service.ts`

## 8) Luu y quan trong khi test phan quyen

- 401: thieu token hoac token sai
- 403: co token nhung role khong duoc phep
- 404: tai nguyen khong ton tai (hoac job inactive voi apply)
- 409: xung dot du lieu (email trung, apply trung)
- 400: payload/query/param khong hop le

## 9) Danh sach trang web phuc vu test role

- `/login`: dang nhap va quick login seed users
- `/`: xem jobs + filter
- `/jobs/[id]`: xem chi tiet + apply
- `/employer/jobs/new`: tao job (EMPLOYER/ADMIN)
- `/recruiter/jobs/new`: alias tao job
- `/admin/users`: quan tri role users (ADMIN)

## 10) Scope hien tai

Project dang o muc starter scaffold:

- Da co auth + role-based access cho cac flow cot loi
- Chua co day du cac flow nang cao (pipeline, interview, moderation, reporting, payment)
- Tai lieu role mo rong co the xem them trong `docs/role-matrix.md`
