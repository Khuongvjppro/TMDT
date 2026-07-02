import { z } from "zod";

export const packageIdParamSchema = z.coerce.number().int().positive();

const priceSchema = z
  .number()
  .int("Price must be an integer")
  .min(1, "Price must be at least 1");

const durationDaysSchema = z
  .number()
  .int("Duration must be an integer")
  .min(1, "Duration must be at least 1 day")
  .max(3650, "Duration cannot exceed 3650 days");

const maxJobPostsSchema = z
  .number()
  .int("Max job posts must be an integer")
  .min(1, "Max job posts must be at least 1");

export const listPackagesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const createPackageSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  price: priceSchema,
  durationDays: durationDaysSchema,
  maxJobPosts: maxJobPostsSchema,
  isActive: z.boolean().optional().default(true),
});

export const updatePackageSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    price: priceSchema.optional(),
    durationDays: durationDaysSchema.optional(),
    maxJobPosts: maxJobPostsSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.price !== undefined ||
      data.durationDays !== undefined ||
      data.maxJobPosts !== undefined,
    { message: "At least one field must be provided" }
  );

export const setPackageStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type ListPackagesQuery = z.infer<typeof listPackagesQuerySchema>;
