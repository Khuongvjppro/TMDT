export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERN"
  | "FREELANCE"
  | "REMOTE";
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
