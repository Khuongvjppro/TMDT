import { prisma } from "../lib/prisma";
import { auditLogService } from "./audit-log.service";
import {
  ConflictError,
  NotFoundError,
} from "../lib/errors";
import {
  HideReviewInput,
  ListReviewsQuery,
  RestoreReviewInput,
} from "../validators/review.validator";

export interface ReviewMeta {
  ipAddress?: string;
  userAgent?: string;
}

const reviewSelect = {
  id: true,
  rating: true,
  content: true,
  isHidden: true,
  hideReason: true,
  hiddenAt: true,
  hiddenBy: true,
  authorId: true,
  jobId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, fullName: true, email: true },
  },
  job: {
    select: { id: true, title: true, companyName: true },
  },
  hiddenByUser: {
    select: { id: true, fullName: true, email: true },
  },
} as const;

export class ReviewService {
  private buildWhere(query: ListReviewsQuery) {
    const where: Record<string, unknown> = {};

    if (query.visibility === "visible") {
      where.isHidden = false;
    } else if (query.visibility === "hidden") {
      where.isHidden = true;
    }

    if (query.jobId) {
      where.jobId = query.jobId;
    }

    if (query.minRating !== undefined || query.maxRating !== undefined) {
      where.rating = {
        ...(query.minRating !== undefined ? { gte: query.minRating } : {}),
        ...(query.maxRating !== undefined ? { lte: query.maxRating } : {}),
      };
    }

    if (query.search) {
      where.OR = [
        { content: { contains: query.search } },
        { author: { fullName: { contains: query.search } } },
        { author: { email: { contains: query.search } } },
        { job: { title: { contains: query.search } } },
        { job: { companyName: { contains: query.search } } },
      ];
    }

    return where;
  }

  async listReviews(query: ListReviewsQuery) {
    const { page, pageSize } = query;
    const where = this.buildWhere(query);

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: reviewSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
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

  async getReviewById(id: number) {
    const review = await prisma.review.findUnique({
      where: { id },
      select: reviewSelect,
    });

    if (!review) {
      throw new NotFoundError("Review");
    }

    return review;
  }

  async listPublicJobReviews(
    jobId: number,
    page: number,
    pageSize: number
  ) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, status: "APPROVED", isActive: true },
      select: { id: true },
    });

    if (!job) {
      throw new NotFoundError("Job");
    }

    const where = { jobId, isHidden: false };

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          author: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
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

  async hideReview(
    id: number,
    input: HideReviewInput,
    adminId: number,
    meta?: ReviewMeta
  ) {
    const existing = await this.getReviewById(id);

    if (existing.isHidden) {
      throw new ConflictError("Review is already hidden");
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        isHidden: true,
        hideReason: input.hideReason.trim(),
        hiddenAt: new Date(),
        hiddenBy: adminId,
      },
      select: reviewSelect,
    });

    await auditLogService.log({
      action: "REVIEW_HIDDEN",
      userId: adminId,
      targetReviewId: review.id,
      targetUserId: review.authorId,
      targetJobId: review.jobId,
      details: {
        hideReason: input.hideReason.trim(),
        rating: review.rating,
        contentPreview: review.content.slice(0, 120),
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return review;
  }

  async restoreReview(
    id: number,
    input: RestoreReviewInput,
    adminId: number,
    meta?: ReviewMeta
  ) {
    const existing = await this.getReviewById(id);

    if (!existing.isHidden) {
      throw new ConflictError("Review is already visible");
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        isHidden: false,
        hideReason: null,
        hiddenAt: null,
        hiddenBy: null,
      },
      select: reviewSelect,
    });

    await auditLogService.log({
      action: "REVIEW_RESTORED",
      userId: adminId,
      targetReviewId: review.id,
      targetUserId: review.authorId,
      targetJobId: review.jobId,
      details: {
        note: input.note?.trim() || null,
        previousHideReason: existing.hideReason,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return review;
  }
}

export const reviewService = new ReviewService();
