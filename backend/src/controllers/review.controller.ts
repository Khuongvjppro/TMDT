import { Request, Response } from "express";
import { reviewService } from "../services/review.service";
import {
  hideReviewSchema,
  listPublicJobReviewsQuerySchema,
  listReviewsQuerySchema,
  restoreReviewSchema,
  reviewIdParamSchema,
} from "../validators/review.validator";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "../lib/api-response";

function getMeta(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  };
}

function requireAdmin(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return req.user;
}

export async function listAdminReviews(req: Request, res: Response) {
  try {
    const parsed = listReviewsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid query", parsed.error.flatten());
    }

    if (
      parsed.data.minRating !== undefined &&
      parsed.data.maxRating !== undefined &&
      parsed.data.minRating > parsed.data.maxRating
    ) {
      return sendValidationError(res, "Invalid rating range", {
        minRating: ["minRating cannot exceed maxRating"],
      });
    }

    const result = await reviewService.listReviews(parsed.data);
    return sendSuccess(res, {
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendError(res, error, "List reviews error");
  }
}

export async function getAdminReview(req: Request, res: Response) {
  try {
    const parsedId = reviewIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid review id", parsedId.error.flatten());
    }

    const review = await reviewService.getReviewById(parsedId.data);
    return sendSuccess(res, { item: review });
  } catch (error) {
    return sendError(res, error, "Get review error");
  }
}

export async function hideReview(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = reviewIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid review id", parsedId.error.flatten());
    }

    const parsed = hideReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid payload", parsed.error.flatten());
    }

    const review = await reviewService.hideReview(
      parsedId.data,
      parsed.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: "Review hidden successfully",
      item: review,
    });
  } catch (error) {
    return sendError(res, error, "Hide review error");
  }
}

export async function restoreReview(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = reviewIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid review id", parsedId.error.flatten());
    }

    const parsed = restoreReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid payload", parsed.error.flatten());
    }

    const review = await reviewService.restoreReview(
      parsedId.data,
      parsed.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: "Review restored successfully",
      item: review,
    });
  } catch (error) {
    return sendError(res, error, "Restore review error");
  }
}

export async function listPublicJobReviews(req: Request, res: Response) {
  try {
    const jobIdParsed = reviewIdParamSchema.safeParse(req.params.id);
    if (!jobIdParsed.success) {
      return sendValidationError(res, "Invalid job id", jobIdParsed.error.flatten());
    }

    const parsedQuery = listPublicJobReviewsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return sendValidationError(res, "Invalid query", parsedQuery.error.flatten());
    }

    const result = await reviewService.listPublicJobReviews(
      jobIdParsed.data,
      parsedQuery.data.page,
      parsedQuery.data.pageSize
    );

    return sendSuccess(res, {
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendError(res, error, "List public job reviews error");
  }
}
