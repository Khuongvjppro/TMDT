import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJobById,
  listJobs,
  setJobActive,
  updateJob
} from "../controllers/jobs.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listJobs);
router.get("/:id", getJobById);
router.post("/", requireAuth, requireRole(["EMPLOYER", "ADMIN"]), createJob);
router.patch("/:id", requireAuth, requireRole(["EMPLOYER", "ADMIN"]), updateJob);
router.patch("/:id/active", requireAuth, requireRole(["EMPLOYER", "ADMIN"]), setJobActive);
router.delete("/:id", requireAuth, requireRole(["EMPLOYER", "ADMIN"]), deleteJob);

export default router;
