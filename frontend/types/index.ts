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
  | "REJECTED"
  | "WITHDRAWN";
export type InterviewMode = "ONLINE" | "ONSITE" | "PHONE";
export type UserRole = "GUEST" | "CANDIDATE" | "EMPLOYER" | "ADMIN";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isEmailVerified?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  requiresEmailVerification: boolean;
  devVerificationToken?: string;
  devVerificationLink?: string;
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
  experienceYears: number;
  description: string;
  requirements: string;
  type: JobType;
  isActive: boolean;
  employerId: number;
  createdAt: string;
  applicationsCount?: number;
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
  credits?: number;
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

export type BillingPackage = {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  maxJobPosts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployerTransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export type EmployerTransaction = {
  id: number;
  transactionCode: string;
  employerId: number;
  packageId: number;
  amountCents: number;
  credits: number;
  status: EmployerTransactionStatus;
  paymentGateway?: string | null;
  gatewayTransactionNo?: string | null;
  gatewayResponseCode?: string | null;
  bankCode?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  package: {
    id: number;
    name: string;
    price: number;
    durationDays: number;
    maxJobPosts: number;
  };
};

export type VnpayPaymentResponse = {
  paymentUrl: string;
  item: EmployerTransaction;
};

export type CandidateApplication = {
  id: number;
  coverLetter?: string | null;
  cvLink?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  withdrawnAt?: string | null;
  candidateId: number;
  jobId: number;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string;
    type: JobType;
  };
};

export type CandidateCv = {
  id: number;
  userId: number;
  title: string;
  fileUrl: string;
  summary?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CandidateProfile = {
  id: number;
  fullName: string;
  email: string;
  candidateProfile?: {
    id: number;
    phone?: string | null;
    bio?: string | null;
    cvLink?: string | null;
    jobTitle?: string | null;
    address?: string | null;
    skills?: string | null;
    experienceYears: number;
  } | null;
  candidateCvs: CandidateCv[];
};

export type SavedJob = {
  id: number;
  candidateId: number;
  jobId: number;
  createdAt: string;
  job: Job;
};

export type JobAlert = {
  id: number;
  name: string;
  keywords?: string | null;
  location?: string | null;
  type?: JobType | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experienceMax?: number | null;
  isActive: boolean;
  lastNotifiedAt?: string | null;
  createdAt: string;
};

export type CompanyReview = {
  id: number;
  employerId: number;
  rating: number;
  title?: string | null;
  content?: string | null;
  employer: {
    id: number;
    fullName: string;
    employerProfile?: EmployerProfile | null;
  };
};

export type CandidateCompany = {
  id: number;
  fullName: string;
  companyName: string;
  locations: string[];
  openJobs: number;
  employerProfile?: EmployerProfile | null;
  reviewCount: number;
  averageRating?: number | null;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  readAt?: string | null;
  createdAt: string;
  sender: { id: number; fullName: string; role: UserRole };
};

export type Conversation = {
  id: number;
  candidateId: number;
  employerId: number;
  updatedAt: string;
  candidate: { id: number; fullName: string; email: string };
  employer: {
    id: number;
    fullName: string;
    email: string;
    employerProfile?: EmployerProfile | null;
  };
  messages: ChatMessage[];
  _count: { messages: number };
};
