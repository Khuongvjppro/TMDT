import { Request, Response } from "express";
import { z } from "zod";
import { JOB_TYPES } from "../constants/enums";
import { prisma } from "../lib/prisma";
import {
  runJobAlertMatchingCycle,
  runJobAlertMatchingForCandidate,
} from "../services/job-alert.service";

const prismaJobAlert = (prisma as any).jobAlert;
const prismaAlertNotification = (prisma as any).alertNotification;

const alertIdParamSchema = z.coerce.number().int().positive();
const notificationIdParamSchema = z.coerce.number().int().positive();

const createAlertRuleSchema = z
  .object({
    keyword: z.string().trim().max(120).optional(),
    location: z.string().trim().max(120).optional(),
    type: z.enum(JOB_TYPES).optional(),
    minSalary: z.coerce.number().int().positive().optional(),
    maxExperienceYears: z.coerce.number().int().min(0).max(50).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.keyword) ||
      Boolean(value.location) ||
      value.type !== undefined ||
      value.minSalary !== undefined ||
      value.maxExperienceYears !== undefined,
    {
      message: "At least one alert condition is required",
      path: ["keyword"],
    },
  );

const updateAlertRuleSchema = z
  .object({
    keyword: z.union([z.string().trim().max(120), z.null()]).optional(),
    location: z.union([z.string().trim().max(120), z.null()]).optional(),
    type: z.union([z.enum(JOB_TYPES), z.null()]).optional(),
    minSalary: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
    maxExperienceYears: z
      .union([z.coerce.number().int().min(0).max(50), z.null()])
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const notificationsQuerySchema = z.object({
  onlyUnread: z.coerce.boolean().default(false),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function listMyAlertRules(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const items = await prismaJobAlert.findMany({
    where: { candidateId: authUser.userId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });

  return res.status(200).json({ items });
}

export async function createMyAlertRule(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = createAlertRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const item = await prismaJobAlert.create({
    data: {
      candidateId: authUser.userId,
      keyword: normalizeOptionalText(parsed.data.keyword),
      location: normalizeOptionalText(parsed.data.location),
      type: parsed.data.type ?? null,
      minSalary: parsed.data.minSalary ?? null,
      maxExperienceYears: parsed.data.maxExperienceYears ?? null,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return res.status(201).json({ item });
}

export async function updateMyAlertRule(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const alertIdParsed = alertIdParamSchema.safeParse(req.params.id);
  if (!alertIdParsed.success) {
    return res.status(400).json({ message: "Invalid alert id" });
  }

  const parsed = updateAlertRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const alertId = alertIdParsed.data;
  const existing = await prismaJobAlert.findFirst({
    where: {
      id: alertId,
      candidateId: authUser.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Alert rule not found" });
  }

  const updateData: {
    keyword?: string | null;
    location?: string | null;
    type?: (typeof JOB_TYPES)[number] | null;
    minSalary?: number | null;
    maxExperienceYears?: number | null;
    isActive?: boolean;
  } = {};

  if ("keyword" in parsed.data) {
    updateData.keyword = normalizeOptionalText(parsed.data.keyword);
  }

  if ("location" in parsed.data) {
    updateData.location = normalizeOptionalText(parsed.data.location);
  }

  if ("type" in parsed.data) {
    updateData.type = parsed.data.type;
  }

  if ("minSalary" in parsed.data) {
    updateData.minSalary = parsed.data.minSalary;
  }

  if ("maxExperienceYears" in parsed.data) {
    updateData.maxExperienceYears = parsed.data.maxExperienceYears;
  }

  if ("isActive" in parsed.data) {
    updateData.isActive = parsed.data.isActive;
  }

  const item = await prismaJobAlert.update({
    where: { id: alertId },
    data: updateData,
  });

  return res.status(200).json({ item });
}

export async function deleteMyAlertRule(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const alertIdParsed = alertIdParamSchema.safeParse(req.params.id);
  if (!alertIdParsed.success) {
    return res.status(400).json({ message: "Invalid alert id" });
  }

  const alertId = alertIdParsed.data;
  const deleted = await prismaJobAlert.deleteMany({
    where: {
      id: alertId,
      candidateId: authUser.userId,
    },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: "Alert rule not found" });
  }

  return res.status(204).send();
}

export async function listMyAlertNotifications(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedQuery = notificationsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res
      .status(400)
      .json({ message: "Invalid query", errors: parsedQuery.error.flatten() });
  }

  const where: {
    candidateId: number;
    isRead?: boolean;
  } = {
    candidateId: authUser.userId,
  };

  if (parsedQuery.data.onlyUnread) {
    where.isRead = false;
  }

  const items = await prismaAlertNotification.findMany({
    where,
    include: {
      job: {
        select: {
          id: true,
          title: true,
          companyName: true,
          location: true,
          type: true,
        },
      },
      alert: {
        select: {
          id: true,
          keyword: true,
          location: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: parsedQuery.data.pageSize,
  });

  return res.status(200).json({ items });
}

export async function markMyAlertNotificationAsRead(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const notificationIdParsed = notificationIdParamSchema.safeParse(
    req.params.id,
  );
  if (!notificationIdParsed.success) {
    return res.status(400).json({ message: "Invalid notification id" });
  }

  const notificationId = notificationIdParsed.data;
  const existing = await prismaAlertNotification.findFirst({
    where: {
      id: notificationId,
      candidateId: authUser.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Notification not found" });
  }

  const item = await prismaAlertNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return res.status(200).json({ item });
}

export async function markAllMyAlertNotificationsAsRead(
  req: Request,
  res: Response,
) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updated = await prismaAlertNotification.updateMany({
    where: {
      candidateId: authUser.userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return res.status(200).json({ item: { updatedCount: updated.count } });
}

export async function runAlertMatchingNow(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const item =
    authUser.role === "ADMIN"
      ? await runJobAlertMatchingCycle()
      : await runJobAlertMatchingForCandidate(authUser.userId);

  return res.status(200).json({ item });
}
