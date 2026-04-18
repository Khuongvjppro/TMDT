import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const PAGE_SIZE_MAX = 50;
const idParamSchema = z.coerce.number().int().positive();
const applicationStatusSchema = z.enum([
  "PENDING",
  "REVIEWING",
  "ACCEPTED",
  "REJECTED",
]);

const updateEmployerProfileSchema = z.object({
  companyName: z.string().min(2),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  companyLocation: z.string().min(2).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
});

const updateApplicationStatusSchema = z.object({
  status: applicationStatusSchema,
});

const listCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(10),
  q: z.string().trim().default(""),
});

const interviewModeSchema = z.enum(["ONLINE", "ONSITE", "PHONE"]);

const upsertInterviewScheduleSchema = z
  .object({
    mode: interviewModeSchema.default("ONLINE"),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    meetingLink: z.string().url().optional().or(z.literal("")),
    location: z.string().max(191).optional().or(z.literal("")),
    note: z.string().max(2000).optional().or(z.literal("")),
  })
  .refine((value) => !Number.isNaN(Date.parse(value.startsAt)), {
    message: "startsAt must be a valid date-time",
    path: ["startsAt"],
  })
  .refine((value) => !Number.isNaN(Date.parse(value.endsAt)), {
    message: "endsAt must be a valid date-time",
    path: ["endsAt"],
  })
  .refine((value) => Date.parse(value.startsAt) < Date.parse(value.endsAt), {
    message: "startsAt must be earlier than endsAt",
    path: ["startsAt"],
  });

function normalizeOptional(value?: string) {
  return value && value.trim() ? value.trim() : null;
}

async function getOwnedApplication(applicationId: number, employerId: number) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: {
          employerId: true,
        },
      },
    },
  });

  if (!application) {
    return { error: "Application not found" as const };
  }

  if (application.job.employerId !== employerId) {
    return {
      error: "You can only access applications for your own jobs" as const,
    };
  }

  return { application };
}

function getAuthUser(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return req.user;
}

export async function getMyEmployerProfile(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { id: true, fullName: true, email: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const profile = await prisma.employerProfile.upsert({
    where: { userId: authUser.userId },
    update: {},
    create: {
      userId: authUser.userId,
      companyName: `${user.fullName} Company`,
    },
  });

  return res.status(200).json({
    item: {
      ...profile,
      fullName: user.fullName,
      email: user.email,
    },
  });
}

export async function updateMyEmployerProfile(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsed = updateEmployerProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { fullName: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updated = await prisma.employerProfile.upsert({
    where: { userId: authUser.userId },
    update: {
      companyName: parsed.data.companyName,
      companyWebsite: parsed.data.companyWebsite || null,
      companyLocation: parsed.data.companyLocation || null,
      description: parsed.data.description || null,
    },
    create: {
      userId: authUser.userId,
      companyName: parsed.data.companyName || `${user.fullName} Company`,
      companyWebsite: parsed.data.companyWebsite || null,
      companyLocation: parsed.data.companyLocation || null,
      description: parsed.data.description || null,
    },
  });

  return res.status(200).json({ item: updated });
}

export async function listMyJobs(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const items = await prisma.job.findMany({
    where: { employerId: authUser.userId },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ items });
}

export async function listCandidates(req: Request, res: Response) {
  const parsedQuery = listCandidatesQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res
      .status(400)
      .json({ message: "Invalid query", errors: parsedQuery.error.flatten() });
  }

  const { page, pageSize, q } = parsedQuery.data;

  const where = {
    role: "CANDIDATE" as const,
    ...(q
      ? {
          OR: [
            { fullName: { contains: q } },
            { email: { contains: q } },
            { candidateProfile: { is: { phone: { contains: q } } } },
            { candidateProfile: { is: { bio: { contains: q } } } },
            { candidateProfile: { is: { cvLink: { contains: q } } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        candidateProfile: {
          select: {
            phone: true,
            bio: true,
            cvLink: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return res.status(200).json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function listApplicationsByJob(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsedId = idParamSchema.safeParse(req.params.jobId);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = parsedId.data;
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.employerId !== authUser.userId) {
    return res.status(403).json({ message: "You can only view applications for your own jobs" });
  }

  const items = await prisma.application.findMany({
    where: { jobId },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          candidateProfile: {
            select: {
              phone: true,
              cvLink: true,
            },
          },
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          companyName: true,
        },
      },
      interviewSchedule: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ items });
}

export async function updateApplicationStatus(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsedApplicationId = idParamSchema.safeParse(req.params.applicationId);
  if (!parsedApplicationId.success) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  const parsedBody = updateApplicationStatusSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsedBody.error.flatten() });
  }

  const application = await prisma.application.findUnique({
    where: { id: parsedApplicationId.data },
    include: { job: { select: { employerId: true } } },
  });

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (application.job.employerId !== authUser.userId) {
    return res
      .status(403)
      .json({ message: "You can only update applications for your own jobs" });
  }

  const updated = await prisma.application.update({
    where: { id: parsedApplicationId.data },
    data: { status: parsedBody.data.status },
  });

  return res.status(200).json({ item: updated });
}

export async function upsertInterviewSchedule(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsedApplicationId = idParamSchema.safeParse(req.params.applicationId);
  if (!parsedApplicationId.success) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  const parsedBody = upsertInterviewScheduleSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsedBody.error.flatten() });
  }

  const ownership = await getOwnedApplication(
    parsedApplicationId.data,
    authUser.userId,
  );

  if (ownership.error === "Application not found") {
    return res.status(404).json({ message: ownership.error });
  }

  if (ownership.error) {
    return res.status(403).json({ message: ownership.error });
  }

  const updated = await prisma.interviewSchedule.upsert({
    where: { applicationId: parsedApplicationId.data },
    update: {
      mode: parsedBody.data.mode,
      startsAt: new Date(parsedBody.data.startsAt),
      endsAt: new Date(parsedBody.data.endsAt),
      meetingLink: normalizeOptional(parsedBody.data.meetingLink),
      location: normalizeOptional(parsedBody.data.location),
      note: normalizeOptional(parsedBody.data.note),
    },
    create: {
      applicationId: parsedApplicationId.data,
      mode: parsedBody.data.mode,
      startsAt: new Date(parsedBody.data.startsAt),
      endsAt: new Date(parsedBody.data.endsAt),
      meetingLink: normalizeOptional(parsedBody.data.meetingLink),
      location: normalizeOptional(parsedBody.data.location),
      note: normalizeOptional(parsedBody.data.note),
    },
  });

  return res.status(200).json({ item: updated });
}

export async function deleteInterviewSchedule(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsedApplicationId = idParamSchema.safeParse(req.params.applicationId);
  if (!parsedApplicationId.success) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  const ownership = await getOwnedApplication(
    parsedApplicationId.data,
    authUser.userId,
  );

  if (ownership.error === "Application not found") {
    return res.status(404).json({ message: ownership.error });
  }

  if (ownership.error) {
    return res.status(403).json({ message: ownership.error });
  }

  const existing = await prisma.interviewSchedule.findUnique({
    where: { applicationId: parsedApplicationId.data },
  });

  if (!existing) {
    return res.status(404).json({ message: "Interview schedule not found" });
  }

  await prisma.interviewSchedule.delete({
    where: { applicationId: parsedApplicationId.data },
  });

  return res.status(204).send();
}
