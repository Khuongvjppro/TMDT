# Admin User Management Module

Complete admin user management system with user locking, soft deletion, role management, and comprehensive audit logging.

## Features

- ✅ User listing with pagination, search, and filtering
- ✅ Lock/unlock accounts with audit trail
- ✅ Soft delete users with reason tracking
- ✅ Role management with profile auto-creation
- ✅ Comprehensive audit logging
- ✅ Security: prevent admin self-lock and self-role-removal
- ✅ Status checking: locked/deleted users cannot login
- ✅ JWT invalidation for locked users

## Database Schema

### User Model Updates

```prisma
enum UserStatus {
  ACTIVE
  LOCKED
  DELETED
}

model User {
  id              Int       @id @default(autoincrement())
  fullName        String
  email           String    @unique
  emailVerifiedAt DateTime?
  passwordHash    String
  role            UserRole  @default(CANDIDATE)
  
  // New fields
  status          UserStatus  @default(ACTIVE)
  violationCount  Int         @default(0)
  lockedAt        DateTime?
  lockedBy        Int?
  deletedAt       DateTime?
  
  // Relations
  auditLogs       AuditLog[]
  @@index([status])
  @@index([email])
}
```

### AuditLog Model

```prisma
enum AuditActionType {
  USER_LOCKED
  USER_UNLOCKED
  USER_DELETED
  ROLE_CHANGED
  STATUS_CHANGED
}

model AuditLog {
  id          Int           @id @default(autoincrement())
  action      AuditActionType
  userId      Int           // Admin who performed action
  targetUserId Int?         // User affected by action
  details     String?       @db.Text
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime      @default(now())

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
  @@index([targetUserId, createdAt])
  @@index([action])
}
```

## API Endpoints

### 1. List Users

**GET** `/api/admin/users`

Query parameters:
- `search` - Search by email or name (optional)
- `role` - Filter by role: GUEST, CANDIDATE, EMPLOYER, ADMIN (optional)
- `status` - Filter by status: ACTIVE, LOCKED, DELETED (optional)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "CANDIDATE",
      "status": "ACTIVE",
      "violationCount": 0,
      "lockedAt": null,
      "lockedBy": null,
      "createdAt": "2026-04-25T10:00:00Z",
      "updatedAt": "2026-04-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "pages": 10
  }
}
```

### 2. Lock User

**POST** `/api/admin/users/:id/lock`

Body (optional):
```json
{
  "reason": "Suspicious activity detected"
}
```

**Response:**
```json
{
  "message": "User locked successfully",
  "item": {
    "id": 2,
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "role": "EMPLOYER",
    "status": "LOCKED",
    "violationCount": 1,
    "lockedAt": "2026-04-25T15:30:00Z",
    "lockedBy": 1,
    "createdAt": "2026-04-20T10:00:00Z",
    "updatedAt": "2026-04-25T15:30:00Z"
  }
}
```

**Error Cases:**
- `403 Forbidden` - Admin trying to lock themselves
- `400 Bad Request` - User already locked
- `404 Not Found` - User not found
- `401 Unauthorized` - Not authenticated

### 3. Unlock User

**POST** `/api/admin/users/:id/unlock`

Body (optional):
```json
{
  "reason": "Appeal accepted"
}
```

**Response:**
```json
{
  "message": "User unlocked successfully",
  "item": {
    "id": 2,
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "role": "EMPLOYER",
    "status": "ACTIVE",
    "violationCount": 0,
    "lockedAt": null,
    "lockedBy": null,
    "createdAt": "2026-04-20T10:00:00Z",
    "updatedAt": "2026-04-25T15:32:00Z"
  }
}
```

**Error Cases:**
- `400 Bad Request` - User is not locked
- `404 Not Found` - User not found

### 4. Soft Delete User

**DELETE** `/api/admin/users/:id`

Body (optional):
```json
{
  "reason": "Duplicate account"
}
```

**Response:**
```json
{
  "message": "User deleted successfully",
  "item": {
    "id": 3,
    "fullName": "Bob Johnson",
    "email": "bob@example.com",
    "role": "CANDIDATE",
    "status": "DELETED",
    "violationCount": 0,
    "lockedAt": null,
    "createdAt": "2026-04-15T10:00:00Z",
    "updatedAt": "2026-04-25T15:35:00Z"
  }
}
```

**Error Cases:**
- `403 Forbidden` - Admin trying to delete themselves
- `400 Bad Request` - User already deleted
- `404 Not Found` - User not found

### 5. Update User Role

**PATCH** `/api/admin/users/:id/role`

Body:
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "message": "User role updated successfully",
  "item": {
    "id": 4,
    "fullName": "Alice Brown",
    "email": "alice@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "violationCount": 0,
    "lockedAt": null,
    "createdAt": "2026-04-18T10:00:00Z",
    "updatedAt": "2026-04-25T15:40:00Z"
  }
}
```

**Error Cases:**
- `403 Forbidden` - Admin trying to remove own ADMIN role
- `404 Not Found` - User not found
- `400 Bad Request` - Invalid role

### 6. Get User Audit Logs

**GET** `/api/admin/users/:id/audit-logs`

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "action": "USER_LOCKED",
      "userId": 1,
      "user": {
        "id": 1,
        "email": "admin@example.com",
        "fullName": "Admin User"
      },
      "targetUserId": 5,
      "details": {
        "reason": "Suspicious activity",
        "userEmail": "suspect@example.com"
      },
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-04-25T15:30:00Z"
    }
  ]
}
```

### 7. Get Audit Logs

**GET** `/api/admin/audit-logs`

Query parameters:
- `action` - Filter by action type (optional)
- `limit` - Number of logs (default: 20)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "action": "USER_LOCKED",
      "userId": 1,
      "user": {
        "id": 1,
        "email": "admin@example.com",
        "fullName": "Admin User"
      },
      "targetUserId": 5,
      "details": {
        "reason": "Suspicious activity",
        "userEmail": "suspect@example.com"
      },
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-04-25T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

## Authentication & Authorization

All endpoints require:
1. Valid Bearer token (`Authorization: Bearer <token>`)
2. User role must be `ADMIN`
3. User status must be `ACTIVE` (not locked or deleted)

```typescript
// Applied to all admin routes
router.use(requireAuth, checkUserStatus, requireRole(["ADMIN"]))
```

## Security Features

### 1. Self-Protection
- Admins cannot lock their own account
- Admins cannot remove their own ADMIN role
- Admins cannot delete their own account

### 2. Token Invalidation
When a user is locked or deleted, their existing JWT tokens are checked on each request:

```typescript
// checkUserStatus middleware
if (user.status === "LOCKED" || user.status === "DELETED") {
  return res.status(403).json({ message: "Account is locked/deleted" });
}
```

### 3. Login Prevention
Login controller prevents locked/deleted users from authenticating:

```typescript
if (user.status === "LOCKED") {
  return res.status(403).json({
    message: "Account is locked",
    code: "ACCOUNT_LOCKED"
  });
}
```

## Audit Logging

All actions are logged with:
- **Action type** - USER_LOCKED, USER_UNLOCKED, etc.
- **Admin ID** - Who performed the action
- **Target user ID** - User affected
- **Details** - JSON object with additional context
- **IP Address** - Request originator
- **User Agent** - Request browser/client
- **Timestamp** - When action occurred

### Sample Audit Log Entry

```json
{
  "id": 5,
  "action": "USER_LOCKED",
  "userId": 1,
  "targetUserId": 7,
  "details": {
    "reason": "Violation of terms",
    "userEmail": "violator@example.com"
  },
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-04-25T16:45:00Z"
}
```

## File Structure

```
backend/src/
├── controllers/
│   └── admin.controller.ts          # Admin endpoint handlers
├── services/
│   ├── admin-user-management.service.ts  # Business logic
│   └── audit-log.service.ts         # Audit logging
├── repositories/
│   └── user.repository.ts           # Database operations
├── validators/
│   └── admin-user.validator.ts      # Input validation
├── middleware/
│   └── auth.ts                      # Auth & status checking
├── routes/
│   └── admin.routes.ts              # Route definitions
├── lib/
│   └── errors.ts                    # Custom error classes
└── constants/
    └── enums.ts                     # Enums (UserStatus, AuditActionType)
```

## Usage Examples

### Example 1: Lock a User Account

```bash
curl -X POST http://localhost:3001/api/admin/users/5/lock \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Multiple failed login attempts"}'
```

### Example 2: Search Users by Email and Filter by Status

```bash
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer <admin_token>" \
  --data-urlencode "search=john@example.com" \
  --data-urlencode "status=ACTIVE" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=20"
```

### Example 3: Update User Role and Check Audit Log

```bash
# Update role
curl -X PATCH http://localhost:3001/api/admin/users/3/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "EMPLOYER"}'

# Get audit logs for that user
curl http://localhost:3001/api/admin/users/3/audit-logs \
  -H "Authorization: Bearer <admin_token>"
```

## Error Handling

Standard HTTP status codes:
- `200 OK` - Successful operation
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions or account locked
- `404 Not Found` - User not found
- `409 Conflict` - Business logic conflict (e.g., user already locked)
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "message": "Description of error",
  "errors": {
    "fieldName": ["Error details"]
  }
}
```

## Running Migrations

```bash
cd backend

# Create migration
npx prisma migrate dev --name add_user_management

# Apply migration in production
npx prisma migrate deploy
```

## Testing Checklist

- [ ] List users with pagination
- [ ] Search users by email/name
- [ ] Filter users by role
- [ ] Filter users by status
- [ ] Lock user and verify they can't login
- [ ] Unlock user and verify they can login
- [ ] Soft delete user
- [ ] Verify admin can't lock themselves
- [ ] Verify admin can't remove own ADMIN role
- [ ] Verify locked user JWT is rejected
- [ ] Check audit logs are created
- [ ] Update user role
- [ ] Verify pagination works correctly

## Notes

- Soft delete sets `status = DELETED` and `deletedAt = now()`, but doesn't remove data
- Violation count resets to 0 when user is unlocked
- All timestamps use ISO 8601 format with UTC timezone
- Pagination uses 1-based page numbers
- Maximum pageSize is 100 to prevent resource exhaustion
