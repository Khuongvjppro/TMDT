# Quick Start - Admin User Management Module

## 📦 Installation & Setup

### 1. Apply Database Migration

```bash
cd backend

# Run migration to add new fields and AuditLog table
npx prisma migrate dev --name add_user_management

# Or in production
npx prisma migrate deploy
```

### 2. Verify Prisma Client

The migration automatically updates the Prisma client. No manual steps needed.

### 3. Test the API

```bash
# Using the provided test script
cd scripts
chmod +x test-admin-api.sh
./test-admin-api.sh <your_admin_token> <user_id_to_test>
```

## 🔑 Authentication

All endpoints require:
1. **Bearer Token**: Valid JWT from login
2. **ADMIN Role**: User must be ADMIN
3. **Active Status**: User cannot be LOCKED or DELETED

Example header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Common Use Cases

### Use Case 1: List All Active Admins

```bash
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "role=ADMIN" \
  --data-urlencode "status=ACTIVE"
```

### Use Case 2: Lock a User for Suspicious Activity

```bash
curl -X POST http://localhost:3001/api/admin/users/42/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Multiple failed login attempts detected"
  }'
```

### Use Case 3: Review Actions on a Locked User

```bash
curl http://localhost:3001/api/admin/users/42/audit-logs \
  -H "Authorization: Bearer $TOKEN"
```

### Use Case 4: Unlock User After Appeal

```bash
curl -X POST http://localhost:3001/api/admin/users/42/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "User appeal accepted - account reinstated"
  }'
```

### Use Case 5: Delete Duplicate Account

```bash
curl -X DELETE http://localhost:3001/api/admin/users/99/delete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Duplicate registration - same email as user #1"
  }'
```

### Use Case 6: Promote User to Admin

```bash
curl -X PATCH http://localhost:3001/api/admin/users/15/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### Use Case 7: Audit All Admin Actions

```bash
curl http://localhost:3001/api/admin/audit-logs \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "action=USER_LOCKED" \
  --data-urlencode "limit=50" \
  --data-urlencode "offset=0"
```

## 🧪 Testing Checklist

Before deploying to production:

- [ ] Run migration successfully
- [ ] Login with admin account
- [ ] List users with pagination
- [ ] Search users by email
- [ ] Filter by role and status
- [ ] Lock a test user
- [ ] Try to login with locked user (should fail)
- [ ] Unlock the test user
- [ ] Try to login with unlocked user (should succeed)
- [ ] Soft delete a test user
- [ ] Verify audit logs show all actions
- [ ] Check that locked user's existing JWT is rejected
- [ ] Verify admin cannot lock themselves
- [ ] Verify admin cannot remove own ADMIN role

## 🚨 Important Notes

### Soft Delete Behavior
- `DELETE /api/admin/users/:id` performs a **soft delete**
- User record remains in database
- User status is set to `DELETED`
- User cannot login or use API endpoints
- Data is retained for audit/compliance

### Token Invalidation
When user is locked or deleted:
1. Immediate: New login attempts are rejected
2. Existing tokens: Checked on every API request via `checkUserStatus` middleware
3. Grace period: None - rejection is immediate

### Self-Protection
Admins are protected from:
- Locking their own account
- Removing their own ADMIN role
- Deleting their own account

Attempting any of these returns **403 Forbidden**.

## 📊 Database Fields

| Field | Type | Notes |
|-------|------|-------|
| `status` | UserStatus | ACTIVE, LOCKED, DELETED |
| `violationCount` | Int | Resets to 0 when unlocked |
| `lockedAt` | DateTime? | Set when locked, cleared on unlock |
| `lockedBy` | Int? | Admin ID who locked account |
| `deletedAt` | DateTime? | Set when soft deleted |

## 🔍 Monitoring Audit Logs

### Get Recent Admin Actions
```bash
curl http://localhost:3001/api/admin/audit-logs \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "limit=100" \
  --data-urlencode "offset=0"
```

### Response Format
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
    "limit": 100,
    "offset": 0
  }
}
```

## 🐛 Troubleshooting

### Q: Migration fails with "Unknown enum"
**A**: Ensure you're using MySQL 5.7+ or MariaDB 10.2+. Prisma enums require modern database support.

### Q: Locked user can still use old token
**A**: Make sure all protected routes use `checkUserStatus` middleware.

### Q: Can't lock admin
**A**: This is by design. Admin accounts have self-protection.

### Q: Audit logs not showing
**A**: Check that Prisma migrations ran successfully and AuditLog table exists.

## 📞 Support

For issues or questions:
1. Check [ADMIN_USER_MANAGEMENT.md](./ADMIN_USER_MANAGEMENT.md) for complete API docs
2. Review [ADMIN_USER_MANAGEMENT_SUMMARY.md](./ADMIN_USER_MANAGEMENT_SUMMARY.md) for implementation details
3. Run the test script: `scripts/test-admin-api.sh`

## ✅ Feature Summary

✓ User listing with pagination  
✓ Advanced search (email/name)  
✓ Role-based filtering  
✓ Status-based filtering  
✓ Lock/unlock accounts  
✓ Soft delete users  
✓ Update user roles  
✓ Comprehensive audit logging  
✓ Self-protection for admins  
✓ Token validation on status change  
✓ Login prevention for locked/deleted users  
✓ IP address logging  
✓ User agent logging  
✓ Full error handling  
✓ Input validation  

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Test with provided script
3. ✅ Integrate into admin frontend UI
4. ⬜ Set up monitoring/alerting on audit logs
5. ⬜ Configure backup/restore procedures
6. ⬜ Train admins on using the system
7. ⬜ Document internal procedures
