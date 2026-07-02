import { prisma } from "../lib/prisma";
import { auditLogService } from "./audit-log.service";
import { notifyJobApproved, notifyJobRejected } from "./notification.service";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../lib/errors";
import { JobStatus } from "../constants/enums";

const employerSelect = {
  id: true,
  fullName: true,
  email: true,
} as const;

export interface ModerationQueueQuery {
  status?: JobStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: "asc" | "desc";
}

export interface ModerationMeta {
  ipAddress?: string;
  userAgent?: string;
}

export class ModerationService {
  async getQueue(query: ModerationQueueQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortOrder = query.sortOrder ?? "desc";

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { companyName: { contains: query.search } },
        { location: { contains: query.search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: { select: employerSelect },
        },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async approveJob(jobId: number, adminId: number, meta?: ModerationMeta) {
    return prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: { id: jobId },
        include: { employer: { select: employerSelect } },
      });

      if (!job) {
        throw new NotFoundError("Job");
      }

      if (job.status !== "PENDING") {
        throw new ConflictError(`Job is already ${job.status}`);
      }

      const updated = await tx.job.update({
        where: { id: jobId },
        data: {
          status: "APPROVED",
          publishedAt: new Date(),
          rejectReason: null,
        },
        include: { employer: { select: employerSelect } },
      });

      await auditLogService.log({
        action: "JOB_APPROVED",
        userId: adminId,
        targetJobId: jobId,
        targetUserId: job.employerId,
        details: {
          jobTitle: job.title,
          previousStatus: "PENDING",
        },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      notifyJobApproved({ employer: job.employer, job: updated }).catch(
        (err) => console.error("Failed to notify job approval:", err)
      );

      return updated;
    });
  }

  async rejectJob(
    jobId: number,
    rejectReason: string,
    adminId: number,
    meta?: ModerationMeta
  ) {
    const trimmedReason = rejectReason?.trim();
    if (!trimmedReason) {
      throw new ValidationError("Reject reason is required");
    }

    return prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: { id: jobId },
        include: { employer: { select: employerSelect } },
      });

      if (!job) {
        throw new NotFoundError("Job");
      }

      if (job.status !== "PENDING") {
        throw new ConflictError(`Job is already ${job.status}`);
      }

      const updated = await tx.job.update({
        where: { id: jobId },
        data: {
          status: "REJECTED",
          rejectReason: trimmedReason,
          publishedAt: null,
        },
        include: { employer: { select: employerSelect } },
      });

      await auditLogService.log({
        action: "JOB_REJECTED",
        userId: adminId,
        targetJobId: jobId,
        targetUserId: job.employerId,
        details: {
          jobTitle: job.title,
          rejectReason: trimmedReason,
        },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      notifyJobRejected({
        employer: job.employer,
        job: updated,
        rejectReason: trimmedReason,
      }).catch((err) => console.error("Failed to notify job rejection:", err));

      return updated;
    });
  }

  async countPending() {
    return prisma.job.count({ where: { status: "PENDING" } });
  }
}

export const moderationService = new ModerationService();
