# Admin User Management - Integration Guide

## Frontend Integration

### Admin Dashboard Component

Example React component for admin user management:

```typescript
// admin/users/page.tsx
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  violationCount: number;
  lockedAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [search, role, status, page]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status }),
      });

      const response = await fetch(
        `/api/admin/users?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();
      setUsers(data.items);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function lockUser(userId: number) {
    const reason = prompt('Enter reason for locking:');
    if (!reason) return;

    try {
      const response = await fetch(
        `/api/admin/users/${userId}/lock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reason })
        }
      );

      if (response.ok) {
        fetchUsers();
        alert('User locked successfully');
      }
    } catch (error) {
      console.error('Failed to lock user:', error);
    }
  }

  async function unlockUser(userId: number) {
    try {
      const response = await fetch(
        `/api/admin/users/${userId}/unlock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({})
        }
      );

      if (response.ok) {
        fetchUsers();
        alert('User unlocked successfully');
      }
    } catch (error) {
      console.error('Failed to unlock user:', error);
    }
  }

  async function deleteUser(userId: number) {
    const reason = prompt('Enter reason for deletion:');
    if (!reason) return;

    try {
      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reason })
        }
      );

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search by email or name"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Roles</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="EMPLOYER">Employer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="LOCKED">Locked</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Email</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Violations</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border">
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.fullName}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-200'
                      : user.status === 'LOCKED'
                      ? 'bg-red-200'
                      : 'bg-gray-200'
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="border p-2">{user.violationCount}</td>
              <td className="border p-2 space-x-2">
                {user.status === 'ACTIVE' && (
                  <button
                    onClick={() => lockUser(user.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Lock
                  </button>
                )}
                {user.status === 'LOCKED' && (
                  <button
                    onClick={() => unlockUser(user.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Unlock
                  </button>
                )}
                <button
                  onClick={() => deleteUser(user.id)}
                  className="px-2 py-1 bg-orange-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### API Client Utility

```typescript
// lib/admin-api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const adminApi = {
  async listUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    params.append('page', (filters?.page || 1).toString());
    params.append('pageSize', (filters?.pageSize || 10).toString());

    return fetch(`${BASE_URL}/admin/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      }
    }).then(r => r.json());
  },

  async lockUser(userId: number, reason?: string) {
    return fetch(`${BASE_URL}/admin/users/${userId}/lock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason })
    }).then(r => r.json());
  },

  async unlockUser(userId: number) {
    return fetch(`${BASE_URL}/admin/users/${userId}/unlock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    }).then(r => r.json());
  },

  async deleteUser(userId: number, reason?: string) {
    return fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason })
    }).then(r => r.json());
  },

  async updateUserRole(userId: number, role: string) {
    return fetch(`${BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role })
    }).then(r => r.json());
  },

  async getUserAuditLogs(userId: number) {
    return fetch(`${BASE_URL}/admin/users/${userId}/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      }
    }).then(r => r.json());
  },

  async getAuditLogs(filters?: { action?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    params.append('limit', (filters?.limit || 20).toString());
    params.append('offset', (filters?.offset || 0).toString());

    return fetch(`${BASE_URL}/admin/audit-logs?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      }
    }).then(r => r.json());
  }
};

function getToken() {
  return localStorage.getItem('accessToken') || '';
}
```

## Backend Middleware Integration

### Using with Existing Routes

```typescript
// routes/index.ts
import { Router } from 'express';
import { requireAuth, requireRole, checkUserStatus } from '../middleware/auth';
import adminRoutes from './admin.routes';

const router = Router();

// Admin routes - protected with auth, status check, and role validation
router.use('/admin', requireAuth, checkUserStatus, requireRole(['ADMIN']), adminRoutes);

export default router;
```

### Custom Admin Middleware

```typescript
// middleware/admin-auth.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthorizationError } from '../lib/errors';

export async function requireAdminWithAudit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Additional admin-specific checks can be added here
  // For example: check admin permissions level, department, etc.

  next();
}
```

## Error Handling Integration

### Global Error Handler

```typescript
// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ message: 'Database error' });
  }

  res.status(500).json({ message: 'Internal server error' });
}
```

## Logging Integration

### Structured Logging

```typescript
// services/logger.service.ts
export const loggerService = {
  logAdminAction: async (
    adminId: number,
    action: string,
    targetUserId?: number,
    details?: Record<string, any>
  ) => {
    // Send to external logging service (ELK, Splunk, etc.)
    console.log({
      timestamp: new Date(),
      adminId,
      action,
      targetUserId,
      details,
      environment: process.env.NODE_ENV
    });
  }
};
```

## Monitoring & Alerts

### Setup Alert for Lock Actions

```typescript
// services/alerts.service.ts
export async function alertOnUserLock(
  userId: number,
  adminId: number,
  reason?: string
) {
  // Send to monitoring service
  const alert = {
    severity: 'info',
    title: 'User Account Locked',
    message: `User ${userId} was locked by admin ${adminId}. Reason: ${reason || 'Not specified'}`,
    timestamp: new Date(),
    tags: ['user_management', 'security']
  };

  // Example: Send to Slack
  // await slackService.sendAlert(alert);

  // Example: Send to email
  // await emailService.alertAdmins(alert);
}
```

## Type Safety

### Using Admin Types in Components

```typescript
import {
  UserWithStatus,
  ListUsersResponse,
  AuditLogEntry,
  AdminContext
} from '../types/admin.types';

async function processLockedUsers(): Promise<UserWithStatus[]> {
  const response: ListUsersResponse = await adminApi.listUsers({
    status: 'LOCKED'
  });
  return response.items;
}
```

## Performance Optimization

### Caching User Lists

```typescript
// services/admin-cache.service.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 }); // 1 minute TTL

export const adminCacheService = {
  getCachedUsers: (key: string) => cache.get(key),
  setCachedUsers: (key: string, data: any) => cache.set(key, data),
  invalidateUserCache: () => cache.flushAll()
};
```

### Use Cache in Controller

```typescript
export async function listUsers(req: Request, res: Response) {
  const cacheKey = `users_${JSON.stringify(req.query)}`;
  const cached = adminCacheService.getCachedUsers(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  const result = await adminUserManagementService.listUsers(req.query);
  adminCacheService.setCachedUsers(cacheKey, result);

  return res.json(result);
}
```

## Testing Integration

### Unit Tests

```typescript
// tests/admin-user-management.test.ts
import { adminUserManagementService } from '../services/admin-user-management.service';

describe('AdminUserManagementService', () => {
  describe('lockUser', () => {
    it('should prevent admin from locking themselves', async () => {
      expect(() =>
        adminUserManagementService.lockUser(1, 1) // Same user
      ).rejects.toThrow('Admin cannot lock their own account');
    });

    it('should lock a user successfully', async () => {
      const user = await adminUserManagementService.lockUser(2, 1);
      expect(user.status).toBe('LOCKED');
      expect(user.lockedBy).toBe(1);
      expect(user.lockedAt).toBeDefined();
    });
  });
});
```

## Deployment Checklist

- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Admin routes mounted correctly
- [ ] Error handlers registered
- [ ] Logging service configured
- [ ] Alert service configured
- [ ] Frontend API client updated
- [ ] Admin UI component integrated
- [ ] Type definitions imported
- [ ] Tests passing
- [ ] Documentation reviewed by team
