import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const jobIdParamSchema = z.coerce.number().int().positive();

const jobSummarySelect = {
  id: true,
  title: true,
  companyName: true,
  location: true,
  salaryMin: true,
  salaryMax: true,
  minExperienceYears: true,
  description: true,
  requirements: true,
  type: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  employerId: true,
  employer: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
} as const;

function parseJobId(idValue: unknown) {
  return jobIdParamSchema.safeParse(idValue);
}

function getAuthCandidateId(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  return req.user.userId;
}

export async function listSavedJobs(req: Request, res: Response) {
  const candidateId = getAuthCandidateId(req, res);
  if (!candidateId) return;

  const items = await (prisma as any).savedJob.findMany({
    where: { candidateId },
    include: {
      job: {
        select: jobSummarySelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ items });
}

export async function getSavedJobStatus(req: Request, res: Response) {
  const candidateId = getAuthCandidateId(req, res);
  if (!candidateId) return;

  const parsedId = parseJobId(req.params.jobId);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = parsedId.data;
  const existing = await (prisma as any).savedJob.findUnique({
    where: {
      candidateId_jobId: {
        candidateId,
        jobId,
      },
    },
    select: { id: true },
  });

  return res.status(200).json({ isSaved: Boolean(existing) });
}

export async function saveJob(req: Request, res: Response) {
  const candidateId = getAuthCandidateId(req, res);
  if (!candidateId) return;

  const parsedId = parseJobId(req.params.jobId);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = parsedId.data;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, isActive: true },
  });

  if (!job || !job.isActive) {
    return res.status(404).json({ message: "Job not found" });
  }

  const existing = await (prisma as any).savedJob.findUnique({
    where: {
      candidateId_jobId: {
        candidateId,
        jobId,
      },
    },
    include: {
      job: {
        select: jobSummarySelect,
      },
    },
  });

  if (existing) {
    return res.status(200).json({ item: existing, alreadySaved: true });
  }

  const item = await (prisma as any).savedJob.create({
    data: {
      candidateId,
      jobId,
    },
    include: {
      job: {
        select: jobSummarySelect,
      },
    },
  });

  return res.status(201).json({ item, alreadySaved: false });
}

export async function unsaveJob(req: Request, res: Response) {
  const candidateId = getAuthCandidateId(req, res);
  if (!candidateId) return;

  const parsedId = parseJobId(req.params.jobId);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = parsedId.data;
  const existing = await (prisma as any).savedJob.findUnique({
    where: {
      candidateId_jobId: {
        candidateId,
        jobId,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Saved job not found" });
  }

  await (prisma as any).savedJob.delete({
    where: {
      candidateId_jobId: {
        candidateId,
        jobId,
      },
    },
  });

  return res.status(204).send();
}
