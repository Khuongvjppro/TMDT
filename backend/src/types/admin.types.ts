import { UserRole, UserStatus, AuditActionType } from "../constants/enums";

// User-related types
export interface UserWithStatus {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  violationCount: number;
  lockedAt: Date | null;
  lockedBy: number | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  violationCount: number;
  lockedAt: Date | null;
  lockedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination
export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export interface PaginationResponse {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

// List users response
export interface ListUsersResponse {
  items: UserWithStatus[];
  pagination: PaginationResponse;
}

// Audit Log types
export interface AuditLogEntry {
  id: number;
  action: AuditActionType;
  userId: number;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  targetUserId: number | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogsResponse {
  items: AuditLogEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Request body types
export interface LockUserRequest {
  reason?: string;
}

export interface UnlockUserRequest {
  reason?: string;
}

export interface SoftDeleteUserRequest {
  reason?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  item?: T;
  items?: T[];
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Service types
export interface ListUsersQuery {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

export interface AuditLogData {
  action: AuditActionType;
  userId: number;
  targetUserId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilter {
  userId?: number;
  targetUserId?: number;
  action?: AuditActionType;
  limit?: number;
  offset?: number;
}

// Admin context
export interface AdminContext {
  userId: number;
  role: "ADMIN";
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

// Request with user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: UserRole;
        email: string;
        tokenType: "access";
      };
      ip?: string;
    }
  }
}

export {};
