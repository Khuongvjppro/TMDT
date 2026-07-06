import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "../constants/enums";

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  sortBy: z.enum(["createdAt", "violationCount", "role"] as const).optional(),
  sortOrder: z.enum(["asc", "desc"] as const).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().min(1).max(100).default(10),
});

export const lockUserSchema = z.object({
  reason: z.string().optional(),
});

export const unlockUserSchema = z.object({
  reason: z.string().optional(),
});

export const softDeleteUserSchema = z.object({
  reason: z.string().optional(),
});

export const restoreUserSchema = z.object({
  reason: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export const bulkUpdateUserRolesSchema = z.object({
  userIds: z.array(z.coerce.number().int().positive()).min(1),
  role: z.enum(USER_ROLES),
});

export const createUserSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    role: z.enum(USER_ROLES),
    invite: z.boolean().optional().default(false),
  })
  .superRefine((data, context) => {
    if (!data.invite && !data.password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required when not sending an invite",
        path: ["password"],
      });
    }
  });

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type LockUserRequest = z.infer<typeof lockUserSchema>;
export type UnlockUserRequest = z.infer<typeof unlockUserSchema>;
export type SoftDeleteUserRequest = z.infer<typeof softDeleteUserSchema>;
export type RestoreUserRequest = z.infer<typeof restoreUserSchema>;
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>;
