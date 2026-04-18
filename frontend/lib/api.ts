import {
  AdminUser,
  ApplicationStatus,
  AuthResponse,
  AuthUser,
  EmployerCandidateListResponse,
  EmployerJobApplication,
  EmployerProfile,
  InterviewMode,
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

export async function updateJob(
  token: string,
  jobId: number,
  payload: {
    title: string;
    companyName: string;
    location: string;
    type: string;
    description: string;
    requirements: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Update job failed");
  }

  return parseJsonResponse<{ item: Job }>(response);
}

export async function deleteJob(token: string, jobId: number) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Delete job failed");
  }
}

export async function setJobActive(
  token: string,
  jobId: number,
  isActive: boolean,
) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Update job status failed");
  }

  return parseJsonResponse<{ item: Job }>(response);
}

export async function getEmployerProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/employer/profile`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load employer profile");
  }

  return parseJsonResponse<{ item: EmployerProfile }>(response);
}

export async function updateEmployerProfile(
  token: string,
  payload: {
    companyName: string;
    companyWebsite?: string;
    companyLocation?: string;
    description?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/employer/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot update employer profile");
  }

  return parseJsonResponse<{ item: EmployerProfile }>(response);
}

export async function listEmployerJobs(token: string) {
  const response = await fetch(`${API_BASE_URL}/employer/jobs`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load employer jobs");
  }

  return parseJsonResponse<{ items: Job[] }>(response);
}

export async function listEmployerCandidates(
  token: string,
  query?: {
    q?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const searchParams = new URLSearchParams();
  if (query?.q) searchParams.set("q", query.q);
  if (query?.page) searchParams.set("page", String(query.page));
  if (query?.pageSize) searchParams.set("pageSize", String(query.pageSize));

  const response = await fetch(
    `${API_BASE_URL}/employer/candidates?${searchParams.toString()}`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load candidates");
  }

  return parseJsonResponse<EmployerCandidateListResponse>(response);
}

export async function listEmployerJobApplications(token: string, jobId: number) {
  const response = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}/applications`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load job applications");
  }

  return parseJsonResponse<{ items: EmployerJobApplication[] }>(response);
}

export async function updateEmployerApplicationStatus(
  token: string,
  applicationId: number,
  status: ApplicationStatus,
) {
  const response = await fetch(
    `${API_BASE_URL}/employer/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot update application status");
  }

  return parseJsonResponse<{ item: EmployerJobApplication }>(response);
}

export async function upsertEmployerInterviewSchedule(
  token: string,
  applicationId: number,
  payload: {
    mode: InterviewMode;
    startsAt: string;
    endsAt: string;
    meetingLink?: string;
    location?: string;
    note?: string;
  },
) {
  const response = await fetch(
    `${API_BASE_URL}/employer/applications/${applicationId}/interview`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot save interview schedule");
  }

  return parseJsonResponse<{
    item: {
      id: number;
      applicationId: number;
      mode: InterviewMode;
      startsAt: string;
      endsAt: string;
      meetingLink?: string | null;
      location?: string | null;
      note?: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }>(response);
}

export async function deleteEmployerInterviewSchedule(
  token: string,
  applicationId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/employer/applications/${applicationId}/interview`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot delete interview schedule");
  }
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
