import { RequestHandler } from "express";
import { requireAuth, requireRole, checkUserStatus } from "./auth";

/**
 * Middleware stack for admin review moderation actions.
 * Ensures authenticated, active ADMIN users only.
 */
export const reviewModerationMiddleware: RequestHandler[] = [
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
];

export function assertReviewModerator(req: { user?: { role: string } }) {
  if (!req.user || req.user.role !== "ADMIN") {
    const error = new Error("Forbidden: review moderation requires ADMIN role");
    (error as any).statusCode = 403;
    throw error;
  }
}
