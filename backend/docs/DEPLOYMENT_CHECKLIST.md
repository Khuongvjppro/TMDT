# Admin User Management - Deployment Checklist

## Pre-Deployment Verification

### Database Setup
- [ ] Backup database before migration
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Verify new fields in User table
  - [ ] `status` column exists (ACTIVE, LOCKED, DELETED)
  - [ ] `violationCount` column exists (default 0)
  - [ ] `lockedAt` column exists (nullable)
  - [ ] `lockedBy` column exists (nullable)
  - [ ] `deletedAt` column exists (nullable)
- [ ] Verify AuditLog table created
  - [ ] `id` (INT, autoincrement, PK)
  - [ ] `action` (ENUM)
  - [ ] `userId` (INT, FK)
  - [ ] `targetUserId` (INT, nullable)
  - [ ] `details` (TEXT, nullable)
  - [ ] `ipAddress` (VARCHAR, nullable)
  - [ ] `userAgent` (VARCHAR, nullable)
  - [ ] `createdAt` (DATETIME)

### Code Files Verification
- [ ] All new files exist and have no syntax errors
  - [ ] `src/lib/errors.ts`
  - [ ] `src/repositories/user.repository.ts`
  - [ ] `src/services/audit-log.service.ts`
  - [ ] `src/services/admin-user-management.service.ts`
  - [ ] `src/validators/admin-user.validator.ts`
  - [ ] `src/types/admin.types.ts`
- [ ] All modified files updated correctly
  - [ ] `src/constants/enums.ts`
  - [ ] `src/middleware/auth.ts`
  - [ ] `src/controllers/admin.controller.ts`
  - [ ] `src/controllers/auth.controller.ts`
  - [ ] `src/routes/admin.routes.ts`
- [ ] No import errors or missing dependencies

### TypeScript Compilation
```bash
cd backend
npm run build
# or
npx tsc --noEmit
```
- [ ] No TypeScript errors
- [ ] All types are correctly resolved

### Dependencies
- [ ] All existing dependencies still installed
- [ ] No conflicting versions
- [ ] Run: `npm audit` for security vulnerabilities
- [ ] Run: `npm ls` to verify dependency tree

## Manual Testing

### 1. Authentication & Authorization
```bash
# Test: Try accessing admin endpoint without token
curl http://localhost:3001/api/admin/users
# Expected: 401 Unauthorized

# Test: Try accessing admin endpoint with non-admin token
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer <candidate_token>"
# Expected: 403 Forbidden
```
- [ ] Unauthorized access rejected
- [ ] Non-admin role rejected
- [ ] Locked user rejected
- [ ] Deleted user rejected

### 2. User Listing
```bash
# List all users
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
# Expected: 200 OK with paginated list
```
- [ ] Returns paginated results
- [ ] Pagination works correctly (page, pageSize)
- [ ] Search works (email/name)
- [ ] Role filter works
- [ ] Status filter works

### 3. Lock User
```bash
curl -X POST http://localhost:3001/api/admin/users/5/lock \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Test lock"}'
# Expected: 200 OK with user status LOCKED
```
- [ ] User status changes to LOCKED
- [ ] `lockedAt` timestamp set
- [ ] `lockedBy` admin ID set
- [ ] Audit log entry created

### 4. Lock Verification
```bash
# Try to login with locked user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"locked@example.com","password":"password"}'
# Expected: 403 Forbidden (Account is locked)
```
- [ ] Locked user cannot login
- [ ] Specific error code returned

### 5. Unlock User
```bash
curl -X POST http://localhost:3001/api/admin/users/5/unlock \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Appeal accepted"}'
# Expected: 200 OK with user status ACTIVE
```
- [ ] User status changes back to ACTIVE
- [ ] `lockedAt` cleared
- [ ] `lockedBy` cleared
- [ ] Violation count reset to 0
- [ ] User can login again

### 6. Soft Delete
```bash
curl -X DELETE http://localhost:3001/api/admin/users/6 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Duplicate account"}'
# Expected: 200 OK with user status DELETED
```
- [ ] User status changes to DELETED
- [ ] `deletedAt` timestamp set
- [ ] User record still exists in database
- [ ] Deleted user cannot login

### 7. Role Update
```bash
curl -X PATCH http://localhost:3001/api/admin/users/7/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"EMPLOYER"}'
# Expected: 200 OK with new role
```
- [ ] User role updated
- [ ] Profile auto-created for new role
- [ ] Audit log entry created

### 8. Self-Protection
```bash
# Try to lock self (assuming admin ID is 1)
curl -X POST http://localhost:3001/api/admin/users/1/lock \
  -H "Authorization: Bearer <admin_token_user_1>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"test"}'
# Expected: 403 Forbidden (cannot lock self)
```
- [ ] Admin cannot lock themselves
- [ ] Admin cannot remove own ADMIN role
- [ ] Admin cannot delete themselves

### 9. Audit Logs
```bash
curl http://localhost:3001/api/admin/users/5/audit-logs \
  -H "Authorization: Bearer <admin_token>"
# Expected: 200 OK with audit entries
```
- [ ] Audit logs show correct action types
- [ ] Admin information included
- [ ] Target user information included
- [ ] Details object populated
- [ ] Timestamps correct

### 10. Status Check on Protected Routes
```bash
# Get token for admin
# Lock that admin
# Try to use admin token to access protected endpoint
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer <now_locked_admin_token>"
# Expected: 403 Forbidden (Account is locked)
```
- [ ] Locked user's existing tokens rejected
- [ ] Immediate effect (not after token expiry)

## Integration Testing

### Test Case: Complete User Lifecycle
1. [ ] Create test user (via registration)
2. [ ] Verify initial status is ACTIVE
3. [ ] Lock the user
4. [ ] Verify user cannot login
5. [ ] Check audit log entry
6. [ ] Unlock the user
7. [ ] Verify user can login
8. [ ] Update user role
9. [ ] Check profile auto-created
10. [ ] Soft delete the user
11. [ ] Verify deleted user cannot login
12. [ ] Verify deleted user data still in database

### Test Case: Admin Security
1. [ ] Try to lock self (should fail)
2. [ ] Try to demote self (should fail)
3. [ ] Try to delete self (should fail)
4. [ ] Lock another user (should succeed)
5. [ ] Verify audit log shows correct admin ID

### Test Case: Search & Filter
1. [ ] Search by partial email (case-insensitive)
2. [ ] Search by partial name
3. [ ] Filter by role (all roles)
4. [ ] Filter by status (all statuses)
5. [ ] Combine filters (role + status)
6. [ ] Pagination with multiple pages
7. [ ] Verify total count accurate

## Performance Testing

```bash
# Test pagination performance
for i in {1..10}; do
  curl http://localhost:3001/api/admin/users?page=$i&pageSize=50 \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\nPage $i: %{time_total}s\n"
done
```
- [ ] Response time < 500ms per page
- [ ] No N+1 query issues
- [ ] Indexes used properly

## Security Testing

```bash
# Test SQL injection
curl "http://localhost:3001/api/admin/users?search='; DROP TABLE users; --" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 200 OK with safe results (no actual drop)

# Test XSS in details
curl -X POST http://localhost:3001/api/admin/users/5/lock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"<script>alert(1)</script>"}'
# Expected: Script stored as plain text, not executed
```
- [ ] SQL injection prevented
- [ ] XSS vectors sanitized
- [ ] CSRF protected (if applicable)

## Documentation Review

- [ ] ADMIN_USER_MANAGEMENT.md complete and accurate
- [ ] QUICK_START.md has working examples
- [ ] INTEGRATION_GUIDE.md clear and comprehensive
- [ ] API endpoint examples tested
- [ ] Error cases documented
- [ ] Examples can be copy-pasted and work

## Deployment Steps

1. [ ] Backup production database
2. [ ] Deploy code changes
3. [ ] Run migration on production: `npx prisma migrate deploy`
4. [ ] Verify migration completed successfully
5. [ ] Monitor error logs for issues
6. [ ] Test critical paths in production
7. [ ] Verify audit logs working
8. [ ] Document completion in deployment log

## Post-Deployment Verification

1. [ ] All endpoints accessible
2. [ ] Lock/unlock functions working
3. [ ] Audit logs being created
4. [ ] No database errors in logs
5. [ ] No API errors in logs
6. [ ] Admin can manage users
7. [ ] Regular users unaffected
8. [ ] Performance acceptable

## Rollback Plan

If issues occur:
1. [ ] Identify specific issue
2. [ ] Check error logs
3. [ ] Verify database state
4. [ ] Option 1: Fix in place (if minor)
5. [ ] Option 2: Rollback migration
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```
6. [ ] Restore from backup if needed
7. [ ] Retest before re-deployment

## Team Sign-Off

- [ ] Backend lead reviewed
- [ ] Database admin approved
- [ ] Security team checked
- [ ] QA completed testing
- [ ] Product owner approved
- [ ] Ready for production deployment

## Notes

- Date deployed: _______________
- Deployed by: _______________
- Issues encountered: _______________
- Resolution: _______________
- Verification completed by: _______________
- Approval date: _______________
