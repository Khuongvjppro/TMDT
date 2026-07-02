import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { JOB_TYPES } from "../constants/enums";

const idSchema = z.coerce.number().int().positive();

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(3000).optional().nullable(),
  jobTitle: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  skills: z.string().trim().max(3000).optional().nullable(),
  experienceYears: z.coerce.number().int().min(0).max(60).default(0),
});

const cvSchema = z.object({
  title: z.string().trim().min(2).max(120),
  fileUrl: z.string().trim().url().max(500),
  summary: z.string().trim().max(3000).optional().nullable(),
  isPrimary: z.boolean().optional(),
});

const alertSchema = z.object({
  name: z.string().trim().min(2).max(120),
  keywords: z.string().trim().max(120).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  type: z.enum(JOB_TYPES).optional().nullable(),
  salaryMin: z.coerce.number().int().min(0).optional().nullable(),
  salaryMax: z.coerce.number().int().min(0).optional().nullable(),
  experienceMax: z.coerce.number().int().min(0).max(60).optional().nullable(),
  isActive: z.boolean().optional(),
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().nullable(),
  content: z.string().trim().max(3000).optional().nullable(),
});

function candidateId(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return req.user.userId;
}

export async function getCandidateProfile(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      candidateProfile: true,
      candidateCvs: { orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }] },
    },
  });

  if (!user) return res.status(404).json({ message: "Candidate not found" });
  return res.status(200).json({ item: user });
}

export async function updateCandidateProfile(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid profile", errors: parsed.error.flatten() });
  }

  const { fullName, ...profile } = parsed.data;
  const item = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { fullName } });
    return tx.candidateProfile.upsert({
      where: { userId },
      update: profile,
      create: { userId, ...profile },
    });
  });
  return res.status(200).json({ item: { ...item, fullName } });
}

export async function listCandidateCvs(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const items = await prisma.candidateCv.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
  });
  return res.status(200).json({ items });
}

export async function createCandidateCv(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const parsed = cvSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid CV", errors: parsed.error.flatten() });
  }

  const existingCount = await prisma.candidateCv.count({ where: { userId } });
  const makePrimary = parsed.data.isPrimary || existingCount === 0;
  const item = await prisma.$transaction(async (tx) => {
    if (makePrimary) {
      await tx.candidateCv.updateMany({ where: { userId }, data: { isPrimary: false } });
    }
    const created = await tx.candidateCv.create({
      data: { ...parsed.data, userId, isPrimary: makePrimary },
    });
    if (makePrimary) {
      await tx.candidateProfile.upsert({
        where: { userId },
        update: { cvLink: created.fileUrl },
        create: { userId, cvLink: created.fileUrl },
      });
    }
    return created;
  });
  return res.status(201).json({ item });
}

export async function updateCandidateCv(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const cvId = idSchema.safeParse(req.params.id);
  const parsed = cvSchema.partial().safeParse(req.body);
  if (!cvId.success || !parsed.success) return res.status(400).json({ message: "Invalid CV payload" });

  const existing = await prisma.candidateCv.findFirst({ where: { id: cvId.data, userId } });
  if (!existing) return res.status(404).json({ message: "CV not found" });

  const item = await prisma.$transaction(async (tx) => {
    if (parsed.data.isPrimary) {
      await tx.candidateCv.updateMany({ where: { userId }, data: { isPrimary: false } });
    }
    const updated = await tx.candidateCv.update({ where: { id: cvId.data }, data: parsed.data });
    if (updated.isPrimary) {
      await tx.candidateProfile.upsert({
        where: { userId },
        update: { cvLink: updated.fileUrl },
        create: { userId, cvLink: updated.fileUrl },
      });
    }
    return updated;
  });
  return res.status(200).json({ item });
}

export async function deleteCandidateCv(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const cvId = idSchema.safeParse(req.params.id);
  if (!cvId.success) return res.status(400).json({ message: "Invalid CV id" });
  const existing = await prisma.candidateCv.findFirst({ where: { id: cvId.data, userId } });
  if (!existing) return res.status(404).json({ message: "CV not found" });

  await prisma.$transaction(async (tx) => {
    await tx.candidateCv.delete({ where: { id: existing.id } });
    if (existing.isPrimary) {
      const fallback = await tx.candidateCv.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });
      if (fallback) await tx.candidateCv.update({ where: { id: fallback.id }, data: { isPrimary: true } });
      await tx.candidateProfile.updateMany({ where: { userId }, data: { cvLink: fallback?.fileUrl ?? null } });
    }
  });
  return res.status(204).send();
}

export async function listSavedJobs(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const items = await prisma.savedJob.findMany({
    where: { candidateId: userId },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
  return res.status(200).json({ items });
}

export async function getSavedJobStatus(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const jobId = idSchema.safeParse(req.params.jobId);
  if (!jobId.success) return res.status(400).json({ message: "Invalid job id" });
  const savedJob = await prisma.savedJob.findUnique({
    where: { candidateId_jobId: { candidateId: userId, jobId: jobId.data } },
    select: { id: true },
  });
  return res.status(200).json({ saved: Boolean(savedJob) });
}

export async function saveJob(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const jobId = idSchema.safeParse(req.params.jobId);
  if (!jobId.success) return res.status(400).json({ message: "Invalid job id" });
  const job = await prisma.job.findFirst({ where: { id: jobId.data, isActive: true } });
  if (!job) return res.status(404).json({ message: "Job not found" });
  const item = await prisma.savedJob.upsert({
    where: { candidateId_jobId: { candidateId: userId, jobId: job.id } },
    update: {},
    create: { candidateId: userId, jobId: job.id },
    include: { job: true },
  });
  return res.status(201).json({ item });
}

export async function unsaveJob(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const jobId = idSchema.safeParse(req.params.jobId);
  if (!jobId.success) return res.status(400).json({ message: "Invalid job id" });
  await prisma.savedJob.deleteMany({ where: { candidateId: userId, jobId: jobId.data } });
  return res.status(204).send();
}

export async function listJobAlerts(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const items = await prisma.jobAlert.findMany({ where: { candidateId: userId }, orderBy: { createdAt: "desc" } });
  return res.status(200).json({ items });
}

export async function createJobAlert(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const parsed = alertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid alert", errors: parsed.error.flatten() });
  const item = await prisma.jobAlert.create({ data: { ...parsed.data, candidateId: userId } });
  return res.status(201).json({ item });
}

export async function updateJobAlert(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const alertId = idSchema.safeParse(req.params.id);
  const parsed = alertSchema.partial().safeParse(req.body);
  if (!alertId.success || !parsed.success) return res.status(400).json({ message: "Invalid alert" });
  const existing = await prisma.jobAlert.findFirst({ where: { id: alertId.data, candidateId: userId } });
  if (!existing) return res.status(404).json({ message: "Alert not found" });
  const item = await prisma.jobAlert.update({ where: { id: existing.id }, data: parsed.data });
  return res.status(200).json({ item });
}

export async function deleteJobAlert(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const alertId = idSchema.safeParse(req.params.id);
  if (!alertId.success) return res.status(400).json({ message: "Invalid alert id" });
  await prisma.jobAlert.deleteMany({ where: { id: alertId.data, candidateId: userId } });
  return res.status(204).send();
}

export async function runJobAlert(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const alertId = idSchema.safeParse(req.params.id);
  if (!alertId.success) return res.status(400).json({ message: "Invalid alert id" });
  const alert = await prisma.jobAlert.findFirst({ where: { id: alertId.data, candidateId: userId } });
  if (!alert) return res.status(404).json({ message: "Alert not found" });

  const and: Array<Record<string, unknown>> = [];
  if (alert.keywords) and.push({ OR: [{ title: { contains: alert.keywords } }, { companyName: { contains: alert.keywords } }] });
  if (alert.location) and.push({ location: { contains: alert.location } });
  if (alert.type) and.push({ type: alert.type });
  if (alert.salaryMin != null) and.push({ salaryMax: { gte: alert.salaryMin } });
  if (alert.salaryMax != null) and.push({ salaryMin: { lte: alert.salaryMax } });
  if (alert.experienceMax != null) and.push({ experienceYears: { lte: alert.experienceMax } });
  const matches = await prisma.job.findMany({ where: { isActive: true, AND: and }, orderBy: { createdAt: "desc" }, take: 10 });
  await prisma.jobAlert.update({ where: { id: alert.id }, data: { lastNotifiedAt: new Date() } });
  return res.status(200).json({
    matches,
    notification: matches.length
      ? `${matches.length} jobs match “${alert.name}”.`
      : `No jobs currently match “${alert.name}”.`,
  });
}

export async function listCompanyReviews(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const items = await prisma.companyReview.findMany({
    where: { candidateId: userId },
    include: { employer: { select: { id: true, fullName: true, employerProfile: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return res.status(200).json({ items });
}

export async function listCompanies(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    select: {
      companyName: true,
      location: true,
      employer: {
        select: {
          id: true,
          fullName: true,
          employerProfile: true,
          receivedReviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { companyName: "asc" },
  });
  const companyMap = new Map<string, (typeof jobs)[number] & { locations: Set<string>; openJobs: number }>();
  for (const job of jobs) {
    const existing = companyMap.get(job.companyName);
    if (existing) {
      existing.locations.add(job.location);
      existing.openJobs += 1;
    } else {
      companyMap.set(job.companyName, { ...job, locations: new Set([job.location]), openJobs: 1 });
    }
  }
  const items = Array.from(companyMap.values()).map(({ companyName, employer, locations, openJobs }) => ({
    id: employer.id,
    fullName: employer.fullName,
    companyName,
    locations: Array.from(locations),
    openJobs,
    employerProfile: employer.employerProfile,
    reviewCount: employer.receivedReviews.length,
    averageRating: employer.receivedReviews.length
      ? employer.receivedReviews.reduce((sum, item) => sum + item.rating, 0) / employer.receivedReviews.length
      : null,
  }));
  return res.status(200).json({ items });
}

export async function upsertCompanyReview(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const employerId = idSchema.safeParse(req.params.employerId);
  const parsed = reviewSchema.safeParse(req.body);
  if (!employerId.success || !parsed.success) return res.status(400).json({ message: "Invalid review" });
  const employer = await prisma.user.findFirst({ where: { id: employerId.data, role: "EMPLOYER" } });
  if (!employer) return res.status(404).json({ message: "Employer not found" });
  const item = await prisma.companyReview.upsert({
    where: { candidateId_employerId: { candidateId: userId, employerId: employer.id } },
    update: parsed.data,
    create: { ...parsed.data, candidateId: userId, employerId: employer.id },
  });
  return res.status(200).json({ item });
}

export async function deleteCompanyReview(req: Request, res: Response) {
  const userId = candidateId(req, res);
  if (!userId) return;
  const employerId = idSchema.safeParse(req.params.employerId);
  if (!employerId.success) return res.status(400).json({ message: "Invalid employer id" });
  await prisma.companyReview.deleteMany({ where: { candidateId: userId, employerId: employerId.data } });
  return res.status(204).send();
}
