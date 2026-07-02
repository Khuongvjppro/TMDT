import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

// Get token from localStorage or auth metadata
function getAuthToken() {
  if (typeof window === "undefined") return null;
  const directToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (directToken) return directToken;
  const rawAuth = localStorage.getItem("jobfinder_auth");
  if (!rawAuth) return null;
  try {
    const parsed = JSON.parse(rawAuth) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Admin API methods
export const adminApi = {
  // List users with filters
  listUsers: async (filters: {
    search?: string;
    role?: string;
    status?: string;
    sortBy?: "createdAt" | "violationCount" | "role";
    sortOrder?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.role) params.append("role", filters.role);
    if (filters.status) params.append("status", filters.status);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    params.append("page", (filters.page || 1).toString());
    params.append("pageSize", (filters.pageSize || 10).toString());

    const response = await apiClient.get(
      `/admin/users?${params.toString()}`
    );
    return response.data;
  },

  // Create user
  createUser: async (payload: {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    invite?: boolean;
  }) => {
    const response = await apiClient.post(`/admin/users`, payload);
    return response.data;
  },
  
  bulkUpdateUserRoles: async (userIds: number[], role: string) => {
    const response = await apiClient.patch(`/admin/users/roles`, {
      userIds,
      role,
    });
    return response.data;
  },

  // Lock user
  lockUser: async (userId: number, reason?: string) => {
    const response = await apiClient.post(
      `/admin/users/${userId}/lock`,
      { reason }
    );
    return response.data;
  },

  // Unlock user
  unlockUser: async (userId: number, reason?: string) => {
    const response = await apiClient.post(
      `/admin/users/${userId}/unlock`,
      { reason }
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number, reason?: string) => {
    const response = await apiClient.delete(
      `/admin/users/${userId}`,
      {
        data: { reason },
      }
    );
    return response.data;
  },

  restoreUser: async (userId: number, reason?: string) => {
    const response = await apiClient.post(
      `/admin/users/${userId}/restore`,
      { reason }
    );
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: number, role: string) => {
    const response = await apiClient.patch(
      `/admin/users/${userId}/role`,
      { role }
    );
    return response.data;
  },

  // Get user audit logs
  getUserAuditLogs: async (userId: number) => {
    const response = await apiClient.get(
      `/admin/users/${userId}/audit-logs`
    );
    return response.data.items;
  },

  // ── Stats endpoints ──────────────────────────────────────────────

  // Get user role distribution stats
  getUserRoleStats: async () => {
    const response = await apiClient.get(`/admin/stats/user-roles`);
    return response.data;
  },

  // Get user status distribution stats
  getUserStatusStats: async () => {
    const response = await apiClient.get(`/admin/stats/user-statuses`);
    return response.data;
  },

  // Get job type distribution stats
  getJobTypeStats: async () => {
    const response = await apiClient.get(`/admin/stats/job-types`);
    return response.data;
  },

  // Get application status distribution stats
  getApplicationStatusStats: async () => {
    const response = await apiClient.get(`/admin/stats/application-statuses`);
    return response.data;
  },

  // Get all audit logs
  getAuditLogs: async (filters?: {
    action?: string;
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.action) params.append("action", filters.action);
    params.append("limit", (filters?.limit || 20).toString());
    params.append("offset", (filters?.offset || 0).toString());

    const response = await apiClient.get(
      `/admin/audit-logs?${params.toString()}`
    );
    return response.data;
  },
};

export default apiClient;
