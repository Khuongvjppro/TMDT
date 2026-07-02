import { Request, Response } from "express";
import { z } from "zod";
import { moderationService } from "../services/moderation.service";
import { JOB_STATUSES } from "../constants/enums";
import { AppError } from "../lib/errors";

const queueQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const jobIdParamSchema = z.coerce.number().int().positive();

const rejectJobSchema = z.object({
  rejectReason: z
    .string()
    .trim()
    .min(3, "Reject reason must be at least 3 characters"),
});

function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }
  console.error("Moderation error:", error);
  return res.status(500).json({ message: "Internal server error" });
}

function getMeta(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  };
}

export async function getModerationQueue(req: Request, res: Response) {
  try {
    const parsed = queueQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid query",
        errors: parsed.error.flatten(),
      });
    }

    const result = await moderationService.getQueue(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function approveJob(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobIdParsed = jobIdParamSchema.safeParse(req.params.id);
    if (!jobIdParsed.success) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await moderationService.approveJob(
      jobIdParsed.data,
      req.user.userId,
      getMeta(req)
    );

    return res.status(200).json({
      message: "Job approved successfully",
      item: job,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function rejectJob(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobIdParsed = jobIdParamSchema.safeParse(req.params.id);
    if (!jobIdParsed.success) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const parsed = rejectJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: parsed.error.flatten(),
      });
    }

    const job = await moderationService.rejectJob(
      jobIdParsed.data,
      parsed.data.rejectReason,
      req.user.userId,
      getMeta(req)
    );

    return res.status(200).json({
      message: "Job rejected successfully",
      item: job,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
