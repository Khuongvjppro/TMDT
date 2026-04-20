import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const prismaCompanyReview = (prisma as any).companyReview;

const jobIdParamSchema = z.coerce.number().int().positive();
const reviewIdParamSchema = z.coerce.number().int().positive();

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
});

const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(10).max(1000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function ensureEmployerUser(employerId: number) {
  return prisma.user.findUnique({
    where: { id: employerId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      employerProfile: {
        select: {
          companyName: true,
        },
      },
    },
  });
}

async function ensureJob(jobId: number) {
  return prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      companyName: true,
      employerId: true,
      employer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function listJobReviews(req: Request, res: Response) {
  const jobIdParsed = jobIdParamSchema.safeParse(req.params.jobId);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const queryParsed = listReviewsQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid query", errors: queryParsed.error.flatten() });
  }

  const jobId = jobIdParsed.data;
  const job = await ensureJob(jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const { page, pageSize } = queryParsed.data;

  const [items, total, aggregated] = await Promise.all([
    prismaCompanyReview.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prismaCompanyReview.count({ where: { jobId } }),
    prismaCompanyReview.aggregate({
      where: { jobId },
      _avg: {
        rating: true,
      },
    }),
  ]);

  return res.status(200).json({
    job: {
      jobId: job.id,
      title: job.title,
      companyName: job.companyName,
      employerId: job.employerId,
      employerName: job.employer.fullName,
    },
    items,
    summary: {
      total,
      averageRating: aggregated._avg.rating,
    },
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function getMyJobReview(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const jobIdParsed = jobIdParamSchema.safeParse(req.params.jobId);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = jobIdParsed.data;
  const item = await prismaCompanyReview.findUnique({
    where: {
      candidateId_jobId: {
        candidateId: authUser.userId,
        jobId,
      },
    },
  });

  return res.status(200).json({ item });
}

export async function createMyJobReview(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const jobIdParsed = jobIdParamSchema.safeParse(req.params.jobId);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const jobId = jobIdParsed.data;
  const job = await ensureJob(jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.employerId === authUser.userId) {
    return res.status(400).json({ message: "Cannot review yourself" });
  }

  const hasApplied = await prisma.application.findUnique({
    where: {
      candidateId_jobId: {
        candidateId: authUser.userId,
        jobId,
      },
    },
  });

  if (!hasApplied) {
    return res.status(403).json({
      message: "You can only review jobs you have applied to",
    });
  }

  try {
    const item = await prismaCompanyReview.create({
      data: {
        candidateId: authUser.userId,
        employerId: job.employerId,
        jobId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    return res.status(201).json({ item });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        message: "You already reviewed this job",
      });
    }
    throw error;
  }
}

export async function updateMyJobReview(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const reviewIdParsed = reviewIdParamSchema.safeParse(req.params.id);
  if (!reviewIdParsed.success) {
    return res.status(400).json({ message: "Invalid review id" });
  }

  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const reviewId = reviewIdParsed.data;
  const existing = await prismaCompanyReview.findFirst({
    where: {
      id: reviewId,
      candidateId: authUser.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Review not found" });
  }

  const item = await prismaCompanyReview.update({
    where: { id: reviewId },
    data: parsed.data,
  });

  return res.status(200).json({ item });
}

export async function deleteMyJobReview(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const reviewIdParsed = reviewIdParamSchema.safeParse(req.params.id);
  if (!reviewIdParsed.success) {
    return res.status(400).json({ message: "Invalid review id" });
  }

  const reviewId = reviewIdParsed.data;
  const deleted = await prismaCompanyReview.deleteMany({
    where: {
      id: reviewId,
      candidateId: authUser.userId,
    },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: "Review not found" });
  }

  return res.status(204).send();
}
