import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const jobIdParamSchema = z.coerce.number().int().positive();
const applicationIdParamSchema = z.coerce.number().int().positive();
const applicationStatuses = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] as const;
const prismaCandidateCv = (prisma as any).candidateCv;

const applySchema = z.object({
  coverLetter: z.string().max(2000).optional(),
  cvLink: z.string().url().optional(),
  cvId: z.coerce.number().int().positive().optional(),
});

export async function applyToJob(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const jobIdParsed = jobIdParamSchema.safeParse(req.params.jobId);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = jobIdParsed.data;
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  let resolvedCvLink = parsed.data.cvLink;
  if (parsed.data.cvId !== undefined) {
    const selectedCv = await prismaCandidateCv.findFirst({
      where: {
        id: parsed.data.cvId,
        candidateId: authUser.userId,
      },
      select: {
        cvUrl: true,
      },
    });

    if (!selectedCv) {
      return res.status(404).json({ message: "CV not found" });
    }

    resolvedCvLink = selectedCv.cvUrl;
  }

  if (!resolvedCvLink) {
    const defaultCv = await prismaCandidateCv.findFirst({
      where: {
        candidateId: authUser.userId,
        isDefault: true,
      },
      select: {
        cvUrl: true,
      },
    });
    resolvedCvLink = defaultCv?.cvUrl;
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || !job.isActive) {
    return res.status(404).json({ message: "Job not found" });
  }

  const existing = await prisma.application.findUnique({
    where: {
      candidateId_jobId: {
        candidateId: authUser.userId,
        jobId,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ message: "You already applied to this job" });
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: authUser.userId,
      coverLetter: parsed.data.coverLetter,
      cvLink: resolvedCvLink,
    },
  });

  return res.status(201).json({ item: application });
}

export async function getMyApplications(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const items = await prisma.application.findMany({
    where: { candidateId: authUser.userId },
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
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ items });
}

export async function getMyApplicationSummary(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [total, grouped] = await Promise.all([
    prisma.application.count({
      where: { candidateId: authUser.userId },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { candidateId: authUser.userId },
      _count: {
        _all: true,
      },
    }),
  ]);

  const byStatus = applicationStatuses.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<(typeof applicationStatuses)[number], number>);

  for (const item of grouped) {
    byStatus[item.status] = item._count._all;
  }

  return res.status(200).json({
    item: {
      total,
      byStatus,
    },
  });
}

export async function withdrawMyApplication(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const applicationIdParsed = applicationIdParamSchema.safeParse(
    req.params.applicationId,
  );
  if (!applicationIdParsed.success) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  const applicationId = applicationIdParsed.data;
  const existing = await prisma.application.findFirst({
    where: {
      id: applicationId,
      candidateId: authUser.userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (existing.status !== "PENDING" && existing.status !== "REVIEWING") {
    return res.status(409).json({
      message: "Only PENDING or REVIEWING applications can be withdrawn",
    });
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });

  return res.status(204).send();
}
