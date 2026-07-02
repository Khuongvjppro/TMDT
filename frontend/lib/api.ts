import {
  AdminUser,
  ApplicationStatus,
  AuthResponse,
  AuthUser,
  BillingPackage,
  CandidateApplication,
  EmployerCandidateListResponse,
  EmployerJobApplication,
  EmployerProfile,
  EmployerTransaction,
  InterviewMode,
  Job,
  JobListResponse,
  RegisterResponse,
  UserRole,
  CandidateProfile,
  CandidateCv,
  SavedJob,
  JobAlert,
  CompanyReview,
  Conversation,
  ChatMessage,
  CandidateCompany,
} from "../types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export async function fetchJobs(query: {
  q?: string;
  location?: string;
  type?: string;
  page?: string;
  salaryMin?: string;
  salaryMax?: string;
  experienceMax?: string;
}) {
  const searchParams = new URLSearchParams();
  if (query.q) searchParams.set("q", query.q);
  if (query.location) searchParams.set("location", query.location);
  if (query.type) searchParams.set("type", query.type);
  if (query.page) searchParams.set("page", query.page);
  if (query.salaryMin) searchParams.set("salaryMin", query.salaryMin);
  if (query.salaryMax) searchParams.set("salaryMax", query.salaryMax);
  if (query.experienceMax) searchParams.set("experienceMax", query.experienceMax);

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
    credentials: "include",
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
  confirmPassword: string;
  role?: "CANDIDATE" | "EMPLOYER";
}) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Register failed");
  }

  return parseJsonResponse<RegisterResponse>(response);
}

export async function verifyEmail(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Email verification failed");
  }

  return parseJsonResponse<{ message: string }>(response);
}

export async function resendVerification(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Resend verification failed");
  }

  return parseJsonResponse<{
    message: string;
    devVerificationToken?: string;
    devVerificationLink?: string;
  }>(response);
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Forgot password failed");
  }

  return parseJsonResponse<{
    message: string;
    devResetPasswordToken?: string;
    devResetPasswordLink?: string;
  }>(response);
}

export async function resetPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Reset password failed");
  }

  return parseJsonResponse<{ message: string }>(response);
}

export async function refreshAuth() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Refresh token failed");
  }

  return parseJsonResponse<AuthResponse>(response);
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Logout failed");
  }
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

export async function listEmployerBillingPackages(token: string) {
  const response = await fetch(`${API_BASE_URL}/employer/billing/packages`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load billing packages");
  }

  return parseJsonResponse<{ items: BillingPackage[] }>(response);
}

export async function purchaseEmployerBillingPackage(
  token: string,
  packageId: number,
) {
  const response = await fetch(`${API_BASE_URL}/employer/billing/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ packageId }),
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Purchase package failed");
  }

  return parseJsonResponse<{ item: EmployerTransaction }>(response);
}

export async function listEmployerTransactions(
  token: string,
  query?: {
    page?: number;
    pageSize?: number;
  },
) {
  const searchParams = new URLSearchParams();
  if (query?.page) searchParams.set("page", String(query.page));
  if (query?.pageSize) searchParams.set("pageSize", String(query.pageSize));

  const response = await fetch(
    `${API_BASE_URL}/employer/transactions?${searchParams.toString()}`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load transactions");
  }

  return parseJsonResponse<{
    items: EmployerTransaction[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>(response);
}

export async function getEmployerPendingApplicationsCount(token: string) {
  const response = await fetch(
    `${API_BASE_URL}/employer/notifications/applications`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load application notifications");
  }

  return parseJsonResponse<{ pendingCount: number }>(response);
}

export async function listEmployerJobApplications(
  token: string,
  jobId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/employer/jobs/${jobId}/applications`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

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

export async function listMyApplications(token: string) {
  const response = await fetch(`${API_BASE_URL}/applications/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Cannot load applications");
  }

  return parseJsonResponse<{ items: CandidateApplication[] }>(response);
}

async function candidateRequest<T>(token: string, path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Backend API is offline. Start the full app with: npm run dev");
  }
  if (!response.ok) {
    const data = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(data.message || "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return parseJsonResponse<T>(response);
}

export function getCandidateProfile(token: string) {
  return candidateRequest<{ item: CandidateProfile }>(token, "/candidate/profile");
}

export function updateCandidateProfile(
  token: string,
  payload: {
    fullName: string;
    phone?: string;
    bio?: string;
    jobTitle?: string;
    address?: string;
    skills?: string;
    experienceYears: number;
  },
) {
  return candidateRequest<{ item: CandidateProfile["candidateProfile"] }>(token, "/candidate/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listCandidateCvs(token: string) {
  return candidateRequest<{ items: CandidateCv[] }>(token, "/candidate/cvs");
}

export function createCandidateCv(token: string, payload: Omit<CandidateCv, "id" | "userId" | "createdAt" | "updatedAt">) {
  return candidateRequest<{ item: CandidateCv }>(token, "/candidate/cvs", { method: "POST", body: JSON.stringify(payload) });
}

export function updateCandidateCv(token: string, id: number, payload: Partial<Pick<CandidateCv, "title" | "fileUrl" | "summary" | "isPrimary">>) {
  return candidateRequest<{ item: CandidateCv }>(token, `/candidate/cvs/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteCandidateCv(token: string, id: number) {
  return candidateRequest<void>(token, `/candidate/cvs/${id}`, { method: "DELETE" });
}

export function listSavedJobs(token: string) {
  return candidateRequest<{ items: SavedJob[] }>(token, "/candidate/saved-jobs");
}

export function getSavedJobStatus(token: string, jobId: number) {
  return candidateRequest<{ saved: boolean }>(token, `/candidate/saved-jobs/${jobId}/status`);
}

export function saveJob(token: string, jobId: number) {
  return candidateRequest<{ item: SavedJob }>(token, `/candidate/saved-jobs/${jobId}`, { method: "POST" });
}

export function unsaveJob(token: string, jobId: number) {
  return candidateRequest<void>(token, `/candidate/saved-jobs/${jobId}`, { method: "DELETE" });
}

export function withdrawApplication(token: string, applicationId: number) {
  return candidateRequest<{ item: CandidateApplication }>(token, `/applications/${applicationId}/withdraw`, { method: "PATCH" });
}

export function listJobAlerts(token: string) {
  return candidateRequest<{ items: JobAlert[] }>(token, "/candidate/alerts");
}

export function createJobAlert(token: string, payload: Omit<JobAlert, "id" | "createdAt" | "lastNotifiedAt">) {
  return candidateRequest<{ item: JobAlert }>(token, "/candidate/alerts", { method: "POST", body: JSON.stringify(payload) });
}

export function updateJobAlert(token: string, id: number, payload: Partial<JobAlert>) {
  return candidateRequest<{ item: JobAlert }>(token, `/candidate/alerts/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteJobAlert(token: string, id: number) {
  return candidateRequest<void>(token, `/candidate/alerts/${id}`, { method: "DELETE" });
}

export function runJobAlert(token: string, id: number) {
  return candidateRequest<{ matches: Job[]; notification: string }>(token, `/candidate/alerts/${id}/run`, { method: "POST" });
}

export function listCompanyReviews(token: string) {
  return candidateRequest<{ items: CompanyReview[] }>(token, "/candidate/reviews");
}

export function listCandidateCompanies(token: string) {
  return candidateRequest<{ items: CandidateCompany[] }>(token, "/candidate/companies");
}

export function saveCompanyReview(token: string, employerId: number, payload: { rating: number; title?: string; content?: string }) {
  return candidateRequest<{ item: CompanyReview }>(token, `/candidate/reviews/${employerId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteCompanyReview(token: string, employerId: number) {
  return candidateRequest<void>(token, `/candidate/reviews/${employerId}`, { method: "DELETE" });
}

export function listConversations(token: string) {
  return candidateRequest<{ items: Conversation[] }>(token, "/chat/conversations");
}

export function createConversation(token: string, employerId: number) {
  return candidateRequest<{ item: Conversation }>(token, "/chat/conversations", { method: "POST", body: JSON.stringify({ employerId }) });
}

export function listMessages(token: string, conversationId: number) {
  return candidateRequest<{ items: ChatMessage[] }>(token, `/chat/conversations/${conversationId}/messages`);
}

export function sendMessage(token: string, conversationId: number, content: string) {
  return candidateRequest<{ item: ChatMessage }>(token, `/chat/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ content }) });
}
