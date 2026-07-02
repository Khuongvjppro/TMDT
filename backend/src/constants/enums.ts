export const USER_ROLES = ["GUEST", "CANDIDATE", "EMPLOYER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REGISTER_ROLES = ["CANDIDATE", "EMPLOYER"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "LOCKED", "DELETED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUDIT_ACTIONS = [
  "USER_LOCKED",
  "USER_UNLOCKED",
  "USER_DELETED",
  "ROLE_CHANGED",
  "STATUS_CHANGED",
  "USER_CREATED",
  "USER_INVITED",
  "JOB_APPROVED",
  "JOB_REJECTED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DELETED",
] as const;

export type AuditActionType = (typeof AUDIT_ACTIONS)[number];

export const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERN", "FREELANCE", "REMOTE"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
