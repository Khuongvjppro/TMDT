import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJobById,
  listJobs,
  setJobActive,
  updateJob,
} from "../controllers/jobs.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/async-handler";

const router = Router();

router.get("/", asyncHandler(listJobs));
router.get("/:id", asyncHandler(getJobById));
router.post("/", requireAuth, requireRole(["EMPLOYER", "ADMIN"]), asyncHandler(createJob));
router.patch(
  "/:id",
  requireAuth,
  requireRole(["EMPLOYER", "ADMIN"]),
  asyncHandler(updateJob),
);
router.patch(
  "/:id/active",
  requireAuth,
  requireRole(["EMPLOYER", "ADMIN"]),
  asyncHandler(setJobActive),
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(["EMPLOYER", "ADMIN"]),
  asyncHandler(deleteJob),
);

export default router;
