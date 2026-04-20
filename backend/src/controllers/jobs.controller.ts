import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { JOB_TYPES, JobType } from "../constants/enums";

const prismaCompanyReview = (prisma as any).companyReview;

const PAGE_SIZE_MAX = 50;
const JOB_SORTS = ["newest", "oldest", "salary_asc", "salary_desc"] as const;
type JobSort = (typeof JOB_SORTS)[number];

const idParamSchema = z.coerce.number().int().positive();

const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(10),
  q: z.string().trim().default(""),
  location: z.string().trim().default(""),
  type: z.enum(JOB_TYPES).optional(),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  maxExperienceYears: z.coerce.number().int().min(0).max(50).optional(),
  sortBy: z.enum(JOB_SORTS).default("newest"),
}).refine((value) => {
  if (value.salaryMin && value.salaryMax) {
    return value.salaryMin <= value.salaryMax;
  }
  return true;
}, {
  message: "salaryMin must be less than or equal to salaryMax",
  path: ["salaryMin"],
});

const jobPayloadSchema = z.object({
  title: z.string().min(2),
  companyName: z.string().min(2),
  location: z.string().min(2),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  minExperienceYears: z.number().int().min(0).max(50).optional(),
  description: z.string().min(10),
  requirements: z.string().min(10),
  type: z.enum(JOB_TYPES),
});

const salaryRangeRefinement = (value: {
  salaryMin?: number;
  salaryMax?: number;
}) => {
  if (value.salaryMin && value.salaryMax) {
    return value.salaryMin <= value.salaryMax;
  }
  return true;
};

const createJobSchema = jobPayloadSchema.refine(salaryRangeRefinement, {
  message: "salaryMin must be less than or equal to salaryMax",
  path: ["salaryMin"],
});

const updateJobSchema = jobPayloadSchema
  .partial()
  .refine(salaryRangeRefinement, {
    message: "salaryMin must be less than or equal to salaryMax",
    path: ["salaryMin"],
  });

const employerSelect = {
  id: true,
  fullName: true,
  email: true,
} as const;

function parseJobId(idValue: unknown) {
  return idParamSchema.safeParse(idValue);
}

function getJobsOrderBy(sortBy: JobSort): Prisma.JobOrderByWithRelationInput[] {
  const asc: Prisma.SortOrder = "asc";
  const desc: Prisma.SortOrder = "desc";

  if (sortBy === "oldest") {
    return [{ createdAt: asc }];
  }

  if (sortBy === "salary_asc") {
    return [{ salaryMin: asc }, { createdAt: desc }];
  }

  if (sortBy === "salary_desc") {
    return [{ salaryMax: desc }, { createdAt: desc }];
  }

  return [{ createdAt: desc }];
}

function getAuthUser(req: Request, res: Response) {
  const authUser = req.user;
  if (!authUser) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return authUser;
}

export async function listJobs(req: Request, res: Response) {
  const parsedQuery = listJobsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res
      .status(400)
      .json({ message: "Invalid query", errors: parsedQuery.error.flatten() });
  }

  const {
    page,
    pageSize,
    q,
    location,
    type,
    salaryMin,
    salaryMax,
    maxExperienceYears,
    sortBy,
  } = parsedQuery.data;

  const andConditions: Array<Record<string, unknown>> = [];
  if (q) {
    andConditions.push({
      OR: [{ title: { contains: q } }, { companyName: { contains: q } }],
    });
  }

  if (location) {
    andConditions.push({ location: { contains: location } });
  }

  if (type) {
    andConditions.push({ type: type as JobType });
  }

  if (salaryMin !== undefined) {
    andConditions.push({
      OR: [{ salaryMax: null }, { salaryMax: { gte: salaryMin } }],
    });
  }

  if (salaryMax !== undefined) {
    andConditions.push({
      OR: [{ salaryMin: null }, { salaryMin: { lte: salaryMax } }],
    });
  }

  if (maxExperienceYears !== undefined) {
    andConditions.push({
      OR: [
        { minExperienceYears: null },
        { minExperienceYears: { lte: maxExperienceYears } },
      ],
    });
  }

  const where: {
    isActive: boolean;
    AND?: Array<Record<string, unknown>>;
  } = {
    isActive: true,
  };

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const orderBy = getJobsOrderBy(sortBy);

  const [rawItems, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        employer: { select: employerSelect },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  const jobIds = rawItems.map((item) => item.id);

  const groupedReviewStats =
    jobIds.length > 0
      ? await prismaCompanyReview.groupBy({
          by: ["jobId"],
          where: {
            jobId: { in: jobIds },
          },
          _avg: {
            rating: true,
          },
          _count: {
            _all: true,
          },
        })
      : [];

  const reviewStatsByJobId = new Map<number, { average: number | null; count: number }>();
  for (const row of groupedReviewStats) {
    reviewStatsByJobId.set(row.jobId, {
      average: row._avg.rating,
      count: row._count._all,
    });
  }

  const items = rawItems.map((item) => {
    const stats = reviewStatsByJobId.get(item.id);
    return {
      ...item,
      jobAverageRating: stats?.average ?? null,
      jobReviewCount: stats?.count ?? 0,
    };
  });

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

export async function getJobById(req: Request, res: Response) {
  const jobIdParsed = parseJobId(req.params.id);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = jobIdParsed.data;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      employer: { select: employerSelect },
    },
  });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const reviewStats = await prismaCompanyReview.aggregate({
    where: { jobId: job.id },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });

  const item = {
    ...job,
    jobAverageRating: reviewStats._avg.rating,
    jobReviewCount: reviewStats._count._all,
  };

  return res.status(200).json({ item });
}

export async function createJob(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const job = await prisma.job.create({
    data: {
      ...parsed.data,
      employerId: authUser.userId,
    },
  });

  return res.status(201).json({ item: job });
}

export async function updateJob(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const jobIdParsed = parseJobId(req.params.id);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = jobIdParsed.data;
  const parsed = updateJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existing) {
    return res.status(404).json({ message: "Job not found" });
  }

  const isAdmin = authUser.role === "ADMIN";
  if (!isAdmin && existing.employerId !== authUser.userId) {
    return res.status(403).json({ message: "You can only edit your own jobs" });
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: parsed.data,
  });

  return res.status(200).json({ item: updated });
}

export async function deleteJob(req: Request, res: Response) {
  const authUser = getAuthUser(req, res);
  if (!authUser) return;

  const jobIdParsed = parseJobId(req.params.id);
  if (!jobIdParsed.success) {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const jobId = jobIdParsed.data;
  const existing = await prisma.job.findUnique({ where: { id: jobId } });

  if (!existing) {
    return res.status(404).json({ message: "Job not found" });
  }

  const isAdmin = authUser.role === "ADMIN";
  if (!isAdmin && existing.employerId !== authUser.userId) {
    return res
      .status(403)
      .json({ message: "You can only delete your own jobs" });
  }

  await prisma.job.delete({ where: { id: jobId } });
  return res.status(204).send();
}
