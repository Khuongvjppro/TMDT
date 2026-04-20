import {
  AdminUser,
  AuthResponse,
  AuthUser,
  Job,
  JobListResponse,
  UserRole,
} from "../types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export async function fetchJobs(query: {
  q?: string;
  location?: string;
  type?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();
  if (query.q) searchParams.set("q", query.q);
  if (query.location) searchParams.set("location", query.location);
  if (query.type) searchParams.set("type", query.type);
  if (query.page) searchParams.set("page", query.page);

  const response = await fetch(
    `${API_BASE_URL}/jobs?${searchParams.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return (await response.json()) as JobListResponse;
}

export async function fetchJobDetail(id: number) {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch job detail");
  }
  const data = (await response.json()) as { item: Job };
  return data.item;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Unexpected response format");
  }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Login failed");
  }

  return parseJsonResponse<AuthResponse>(response);
}

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
  role?: "CANDIDATE" | "EMPLOYER";
}) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Register failed");
  }

  return parseJsonResponse<AuthResponse>(response);
}

export async function fetchMe(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load profile");
  }

  return parseJsonResponse<{ user: AuthUser }>(response);
}

export async function createJob(
  token: string,
  payload: {
    title: string;
    companyName: string;
    location: string;
    type: string;
    description: string;
    requirements: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Create job failed");
  }

  return parseJsonResponse<{ item: Job }>(response);
}

export async function applyToJob(
  token: string,
  jobId: number,
  payload: {
    coverLetter?: string;
    cvLink?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/applications/jobs/${jobId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Apply failed");
  }

  return parseJsonResponse<{ item: { id: number } }>(response);
}

export async function listUsers(token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load users");
  }

  return parseJsonResponse<{ items: AdminUser[] }>(response);
}

export async function updateUserRole(
  token: string,
  userId: number,
  role: UserRole,
) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Update role failed");
  }

  return parseJsonResponse<{ item: AdminUser }>(response);
}
