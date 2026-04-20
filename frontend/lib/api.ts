import {
  AlertMatchingStats,
  AlertNotificationItem,
  ApplicationItem,
  ApplicationSummary,
  AdminUser,
  AuthResponse,
  AuthUser,
  CandidateCv,
  CandidateProfile,
  CompanyReviewItem,
  CompanyReviewListResponse,
  ChatContact,
  ChatConversation,
  ChatMessage,
  Job,
  JobAlertRule,
  JobListResponse,
  SavedJobItem,
  UserRole,
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
  maxExperienceYears?: string;
  sortBy?: string;
}) {
  const searchParams = new URLSearchParams();
  if (query.q) searchParams.set("q", query.q);
  if (query.location) searchParams.set("location", query.location);
  if (query.type) searchParams.set("type", query.type);
  if (query.page) searchParams.set("page", query.page);
  if (query.salaryMin) searchParams.set("salaryMin", query.salaryMin);
  if (query.salaryMax) searchParams.set("salaryMax", query.salaryMax);
  if (query.maxExperienceYears) {
    searchParams.set("maxExperienceYears", query.maxExperienceYears);
  }
  if (query.sortBy) searchParams.set("sortBy", query.sortBy);

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

export async function fetchCompanyReviews(
  jobId: number,
  options?: {
    page?: number;
    pageSize?: number;
  },
  token?: string,
) {
  const searchParams = new URLSearchParams();
  if (options?.page !== undefined) {
    searchParams.set("page", String(options.page));
  }
  if (options?.pageSize !== undefined) {
    searchParams.set("pageSize", String(options.pageSize));
  }

  const query = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/reviews/jobs/${jobId}${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load job reviews"));
  }

  return parseJsonResponse<CompanyReviewListResponse>(response);
}

export async function fetchMyCompanyReview(token: string, jobId: number) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/jobs/${jobId}/my-review`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load your review"));
  }

  return parseJsonResponse<{ item: CompanyReviewItem | null }>(response);
}

export async function createCompanyReview(
  token: string,
  jobId: number,
  payload: {
    rating: number;
    comment: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/reviews/jobs/${jobId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot create review"));
  }

  return parseJsonResponse<{ item: CompanyReviewItem }>(response);
}

export async function updateCompanyReview(
  token: string,
  reviewId: number,
  payload: {
    rating?: number;
    comment?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot update review"));
  }

  return parseJsonResponse<{ item: CompanyReviewItem }>(response);
}

export async function deleteCompanyReview(token: string, reviewId: number) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot delete review"));
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Unexpected response format");
  }
}

type ApiErrorPayload = {
  message?: string;
  errors?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

async function parseApiErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    return fallbackMessage;
  }

  const fieldErrors = payload.errors?.fieldErrors;
  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages && messages.length > 0) {
        return `${field}: ${messages[0]}`;
      }
    }
  }

  const formErrors = payload.errors?.formErrors;
  if (formErrors && formErrors.length > 0) {
    return formErrors[0];
  }

  return payload.message || fallbackMessage;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Login failed"));
  }

  return parseJsonResponse<AuthResponse>(response);
}

export async function fetchMe(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load profile"));
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
    salaryMin?: number;
    salaryMax?: number;
    minExperienceYears?: number;
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
    throw new Error(await parseApiErrorMessage(response, "Create job failed"));
  }

  return parseJsonResponse<{ item: Job }>(response);
}

export async function applyToJob(
  token: string,
  jobId: number,
  payload: {
    coverLetter?: string;
    cvLink?: string;
    cvId?: number;
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
    throw new Error(await parseApiErrorMessage(response, "Apply failed"));
  }

  return parseJsonResponse<{ item: { id: number } }>(response);
}

export async function fetchMyApplications(token: string) {
  const response = await fetch(`${API_BASE_URL}/applications/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot load applications"),
    );
  }

  return parseJsonResponse<{ items: ApplicationItem[] }>(response);
}

export async function fetchMyApplicationSummary(token: string) {
  const response = await fetch(`${API_BASE_URL}/applications/me/summary`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot load application summary"),
    );
  }

  return parseJsonResponse<{ item: ApplicationSummary }>(response);
}

export async function withdrawMyApplication(token: string, applicationId: number) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/withdraw`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot withdraw application"),
    );
  }
}

export async function listMyAlertRules(token: string) {
  const response = await fetch(`${API_BASE_URL}/alerts/rules`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load alert rules"));
  }

  return parseJsonResponse<{ items: JobAlertRule[] }>(response);
}

export async function createMyAlertRule(
  token: string,
  payload: {
    keyword?: string;
    location?: string;
    type?: string;
    minSalary?: number;
    maxExperienceYears?: number;
    isActive?: boolean;
  },
) {
  const response = await fetch(`${API_BASE_URL}/alerts/rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot create alert rule"));
  }

  return parseJsonResponse<{ item: JobAlertRule }>(response);
}

export async function updateMyAlertRule(
  token: string,
  alertId: number,
  payload: {
    keyword?: string | null;
    location?: string | null;
    type?: string | null;
    minSalary?: number | null;
    maxExperienceYears?: number | null;
    isActive?: boolean;
  },
) {
  const response = await fetch(`${API_BASE_URL}/alerts/rules/${alertId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot update alert rule"));
  }

  return parseJsonResponse<{ item: JobAlertRule }>(response);
}

export async function deleteMyAlertRule(token: string, alertId: number) {
  const response = await fetch(`${API_BASE_URL}/alerts/rules/${alertId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot delete alert rule"));
  }
}

export async function runMyAlertMatchingNow(token: string) {
  const response = await fetch(`${API_BASE_URL}/alerts/run`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot run alert matching"));
  }

  return parseJsonResponse<{ item: AlertMatchingStats }>(response);
}

export async function listMyAlertNotifications(
  token: string,
  options?: { onlyUnread?: boolean; pageSize?: number },
) {
  const searchParams = new URLSearchParams();
  if (options?.onlyUnread !== undefined) {
    searchParams.set("onlyUnread", String(options.onlyUnread));
  }
  if (options?.pageSize !== undefined) {
    searchParams.set("pageSize", String(options.pageSize));
  }

  const query = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/alerts/notifications${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot load alert notifications"),
    );
  }

  return parseJsonResponse<{ items: AlertNotificationItem[] }>(response);
}

export async function markMyAlertNotificationAsRead(
  token: string,
  notificationId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/alerts/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot mark notification as read"),
    );
  }

  return parseJsonResponse<{ item: AlertNotificationItem }>(response);
}

export async function markAllMyAlertNotificationsAsRead(token: string) {
  const response = await fetch(`${API_BASE_URL}/alerts/notifications/read-all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot mark all notifications as read"),
    );
  }

  return parseJsonResponse<{ item: { updatedCount: number } }>(response);
}

export async function listChatConversations(token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load conversations"));
  }

  return parseJsonResponse<{ items: ChatConversation[] }>(response);
}

export async function listChatContacts(token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/contacts`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load chat contacts"));
  }

  return parseJsonResponse<{ items: ChatContact[] }>(response);
}

export async function createChatConversation(
  token: string,
  payload: {
    participantId: number;
    initialMessage?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot create conversation"));
  }

  return parseJsonResponse<{ item: ChatConversation; created: boolean }>(response);
}

export async function listConversationMessages(
  token: string,
  conversationId: number,
  options?: {
    afterId?: number;
    pageSize?: number;
  },
) {
  const searchParams = new URLSearchParams();
  if (options?.afterId !== undefined) {
    searchParams.set("afterId", String(options.afterId));
  }
  if (options?.pageSize !== undefined) {
    searchParams.set("pageSize", String(options.pageSize));
  }

  const query = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load messages"));
  }

  return parseJsonResponse<{ items: ChatMessage[] }>(response);
}

export async function sendConversationMessage(
  token: string,
  conversationId: number,
  content: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot send message"));
  }

  return parseJsonResponse<{ item: ChatMessage }>(response);
}

export async function listUsers(token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load users"));
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
    throw new Error(await parseApiErrorMessage(response, "Update role failed"));
  }

  return parseJsonResponse<{ item: AdminUser }>(response);
}

export async function fetchCandidateProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot load candidate profile"),
    );
  }

  return parseJsonResponse<{ item: CandidateProfile }>(response);
}

export async function updateCandidateProfile(
  token: string,
  payload: {
    fullName?: string;
    phone?: string | null;
    bio?: string | null;
    cvLink?: string | null;
  },
) {
  const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, "Cannot update candidate profile"),
    );
  }

  return parseJsonResponse<{ item: CandidateProfile }>(response);
}

export async function listCandidateCvs(token: string) {
  const response = await fetch(`${API_BASE_URL}/candidate/cvs`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load CVs"));
  }

  return parseJsonResponse<{ items: CandidateCv[] }>(response);
}

export async function createCandidateCv(
  token: string,
  payload: {
    title: string;
    cvUrl: string;
    summary?: string;
    isDefault?: boolean;
  },
) {
  const response = await fetch(`${API_BASE_URL}/candidate/cvs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot create CV"));
  }

  return parseJsonResponse<{ item: CandidateCv }>(response);
}

export async function updateCandidateCv(
  token: string,
  cvId: number,
  payload: {
    title?: string;
    cvUrl?: string;
    summary?: string | null;
    isDefault?: boolean;
  },
) {
  const response = await fetch(`${API_BASE_URL}/candidate/cvs/${cvId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot update CV"));
  }

  return parseJsonResponse<{ item: CandidateCv }>(response);
}

export async function deleteCandidateCv(token: string, cvId: number) {
  const response = await fetch(`${API_BASE_URL}/candidate/cvs/${cvId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot delete CV"));
  }
}

export async function setDefaultCandidateCv(token: string, cvId: number) {
  const response = await fetch(`${API_BASE_URL}/candidate/cvs/${cvId}/default`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot set default CV"));
  }

  return parseJsonResponse<{ item: CandidateCv }>(response);
}

export async function listSavedJobs(token: string) {
  const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot load saved jobs"));
  }

  return parseJsonResponse<{ items: SavedJobItem[] }>(response);
}

export async function getSavedJobStatus(token: string, jobId: number) {
  const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}/status`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot check saved status"));
  }

  return parseJsonResponse<{ isSaved: boolean }>(response);
}

export async function saveJob(token: string, jobId: number) {
  const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot save job"));
  }

  return parseJsonResponse<{ item: SavedJobItem; alreadySaved: boolean }>(response);
}

export async function unsaveJob(token: string, jobId: number) {
  const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Cannot unsave job"));
  }
}
