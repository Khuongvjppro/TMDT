export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERN"
  | "FREELANCE"
  | "REMOTE";
export type UserRole = "GUEST" | "CANDIDATE" | "EMPLOYER" | "ADMIN";
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "ACCEPTED"
  | "REJECTED";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type Job = {
  id: number;
  title: string;
  companyName: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  minExperienceYears?: number | null;
  description: string;
  requirements: string;
  type: JobType;
  isActive?: boolean;
  employerId: number;
  jobAverageRating?: number | null;
  jobReviewCount?: number;
  createdAt: string;
  updatedAt?: string;
  employer?: {
    id: number;
    fullName: string;
    email: string;
  };
};

export type JobListResponse = {
  items: Job[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CompanyReviewItem = {
  id: number;
  candidateId: number;
  employerId: number;
  jobId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  candidate?: {
    id: number;
    fullName: string;
    email: string;
  };
};

export type CompanyReviewListResponse = {
  job: {
    jobId: number;
    title: string;
    companyName: string;
    employerId: number;
    employerName: string;
  };
  items: CompanyReviewItem[];
  summary: {
    total: number;
    averageRating?: number | null;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CandidateProfile = {
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  cvLink?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CandidateCv = {
  id: number;
  candidateId: number;
  title: string;
  cvUrl: string;
  summary?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SavedJobItem = {
  id: number;
  candidateId: number;
  jobId: number;
  createdAt: string;
  job: Job;
};

export type ApplicationItem = {
  id: number;
  candidateId: number;
  jobId: number;
  coverLetter?: string | null;
  cvLink?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  job: Pick<Job, "id" | "title" | "companyName" | "location" | "type">;
};

export type ApplicationSummary = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
};

export type JobAlertRule = {
  id: number;
  candidateId: number;
  keyword?: string | null;
  location?: string | null;
  type?: JobType | null;
  minSalary?: number | null;
  maxExperienceYears?: number | null;
  isActive: boolean;
  lastCheckedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AlertNotificationItem = {
  id: number;
  alertId: number;
  candidateId: number;
  jobId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  job: Pick<Job, "id" | "title" | "companyName" | "location" | "type">;
  alert: Pick<JobAlertRule, "id" | "keyword" | "location" | "type">;
};

export type AlertMatchingStats = {
  processedRules: number;
  matchedJobs: number;
  createdNotifications: number;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type ChatConversation = {
  id: number;
  candidateId: number;
  employerId: number;
  createdAt: string;
  updatedAt: string;
  peerUser: {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
  };
  lastMessage?: ChatMessage | null;
  unreadCount: number;
};

export type ChatContact = {
  id: number;
  participantId: number;
  role: "CANDIDATE" | "EMPLOYER";
  fullName: string;
  email: string;
  companyName?: string | null;
  jobId?: number;
  jobTitle?: string;
  label: string;
};
