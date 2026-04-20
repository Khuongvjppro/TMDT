import { Router } from "express";
import {
	applyToJob,
	getMyApplicationSummary,
	getMyApplications,
	withdrawMyApplication,
} from "../controllers/applications.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/me/summary", requireAuth, requireRole(["CANDIDATE", "ADMIN"]), getMyApplicationSummary);
router.get("/me", requireAuth, requireRole(["CANDIDATE", "ADMIN"]), getMyApplications);
router.post("/jobs/:jobId", requireAuth, requireRole(["CANDIDATE", "ADMIN"]), applyToJob);
router.delete("/:applicationId/withdraw", requireAuth, requireRole(["CANDIDATE", "ADMIN"]), withdrawMyApplication);

export default router;
