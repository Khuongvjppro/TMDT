import { z } from "zod";

export const reviewIdParamSchema = z.coerce.number().int().positive();

export const listReviewsQuerySchema = z.object({
  search: z.string().trim().optional(),
  visibility: z.enum(["all", "visible", "hidden"]).optional().default("all"),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  maxRating: z.coerce.number().int().min(1).max(5).optional(),
  jobId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const hideReviewSchema = z.object({
  hideReason: z
    .string()
    .trim()
    .min(3, "Hide reason must be at least 3 characters")
    .max(1000),
});

export const restoreReviewSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export const listPublicJobReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type HideReviewInput = z.infer<typeof hideReviewSchema>;
export type RestoreReviewInput = z.infer<typeof restoreReviewSchema>;
