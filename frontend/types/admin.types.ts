export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN" | "GUEST";
  status: "ACTIVE" | "LOCKED" | "DELETED";
  violationCount: number;
  lockedAt: string | null;
  lockedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersResponse {
  items: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  item?: T;
  items?: T[];
  errors?: Record<string, string[]>;
}

export interface AuditLog {
  id: number;
  action: string;
  userId: number;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  targetUserId: number | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export interface ConfirmationModal {
  isOpen: boolean;
  title: string;
  message: string;
  action: "lock" | "unlock" | "delete" | "role" | null;
  targetUserId: number | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export interface Filters {
  search: string;
  role: string;
  status: string;
  sortBy?: "createdAt" | "violationCount" | "role";
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}
