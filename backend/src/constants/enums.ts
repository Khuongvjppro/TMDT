export const USER_ROLES = ["GUEST", "CANDIDATE", "EMPLOYER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REGISTER_ROLES = ["CANDIDATE", "EMPLOYER"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERN", "FREELANCE", "REMOTE"] as const;
export type JobType = (typeof JOB_TYPES)[number];
