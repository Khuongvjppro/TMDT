import { Router } from "express";
import {
  createMyJobReview,
  deleteMyJobReview,
  getMyJobReview,
  listJobReviews,
  updateMyJobReview,
} from "../controllers/reviews.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/jobs/:jobId", listJobReviews);
router.get(
  "/jobs/:jobId/my-review",
  requireAuth,
  requireRole(["CANDIDATE"]),
  getMyJobReview,
);
router.post(
  "/jobs/:jobId",
  requireAuth,
  requireRole(["CANDIDATE"]),
  createMyJobReview,
);
router.patch("/:id", requireAuth, requireRole(["CANDIDATE"]), updateMyJobReview);
router.delete("/:id", requireAuth, requireRole(["CANDIDATE"]), deleteMyJobReview);

export default router;
