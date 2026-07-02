import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const jobIdParamSchema = z.coerce.number().int().positive();

const applySchema = z.object({
  coverLetter: z.string().max(2000).optional(),
  cvLink: z.string().url().optional(),
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

  const primaryCv = parsed.data.cvLink
    ? null
    : await prisma.candidateCv.findFirst({
        where: { userId: authUser.userId },
        orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      });

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: authUser.userId,
      coverLetter: parsed.data.coverLetter,
      cvLink: parsed.data.cvLink || primaryCv?.fileUrl,
    },
  });

  return res.status(201).json({ item: application });
}

export async function withdrawApplication(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) return res.status(401).json({ message: "Unauthorized" });
  const applicationId = jobIdParamSchema.safeParse(req.params.applicationId);
  if (!applicationId.success) return res.status(400).json({ message: "Invalid application id" });

  const existing = await prisma.application.findFirst({
    where: { id: applicationId.data, candidateId: authUser.userId },
  });
  if (!existing) return res.status(404).json({ message: "Application not found" });
  if (!(["PENDING", "REVIEWING"] as const).includes(existing.status as "PENDING" | "REVIEWING")) {
    return res.status(409).json({ message: "Only pending or reviewing applications can be withdrawn" });
  }

  const item = await prisma.application.update({
    where: { id: existing.id },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
    include: { job: true },
  });
  return res.status(200).json({ item });
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
