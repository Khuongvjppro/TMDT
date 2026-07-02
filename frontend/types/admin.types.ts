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

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  search: string;
  includeDeleted: boolean;
  page: number;
  pageSize: number;
}

export interface CategoryListResponse {
  success: boolean;
  items: Category[];
  pagination: PaginationMeta;
}

export type JobModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ModerationJob {
  id: number;
  employerId: number;
  title: string;
  companyName: string;
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "INTERN" | "FREELANCE" | "REMOTE";
  description: string;
  requirements: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceYears: number | null;
  status: JobModerationStatus;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  employer: Pick<User, "id" | "fullName" | "email">;
}

export interface ModerationFilters {
  search: string;
  status: JobModerationStatus | "";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface ModerationQueueResponse {
  items: ModerationJob[];
  pagination: PaginationMeta;
}

export interface AdminReview {
  id: number;
  rating: number;
  content: string;
  isHidden: boolean;
  hideReason: string | null;
  hiddenAt: string | null;
  hiddenBy: number | null;
  authorId: number;
  jobId: number;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, "id" | "fullName" | "email">;
  job: { id: number; title: string; companyName: string };
  hiddenByUser: Pick<User, "id" | "fullName" | "email"> | null;
}

export interface ReviewFilters {
  search: string;
  visibility: "all" | "visible" | "hidden";
  minRating: string;
  maxRating: string;
  page: number;
  pageSize: number;
}

export interface ReviewListResponse {
  success: boolean;
  items: AdminReview[];
  pagination: PaginationMeta;
}
