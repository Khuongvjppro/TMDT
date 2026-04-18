export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERN"
  | "FREELANCE"
  | "REMOTE";
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "ACCEPTED"
  | "REJECTED";
export type InterviewMode = "ONLINE" | "ONSITE" | "PHONE";
export type UserRole = "GUEST" | "CANDIDATE" | "EMPLOYER" | "ADMIN";

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
  description: string;
  requirements: string;
  type: JobType;
  isActive: boolean;
  employerId: number;
  createdAt: string;
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

export type EmployerProfile = {
  id: number;
  userId: number;
  companyName: string;
  companyWebsite?: string | null;
  companyLocation?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  email?: string;
};

export type EmployerJobApplication = {
  id: number;
  coverLetter?: string | null;
  cvLink?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  candidate: {
    id: number;
    fullName: string;
    email: string;
    candidateProfile?: {
      phone?: string | null;
      cvLink?: string | null;
    } | null;
  };
  job: {
    id: number;
    title: string;
    companyName: string;
  };
  interviewSchedule?: {
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
  } | null;
};

export type EmployerCandidate = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  candidateProfile?: {
    phone?: string | null;
    bio?: string | null;
    cvLink?: string | null;
  } | null;
  _count: {
    applications: number;
  };
};

export type EmployerCandidateListResponse = {
  items: EmployerCandidate[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
