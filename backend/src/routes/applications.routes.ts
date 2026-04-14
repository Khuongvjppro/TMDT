import { Router } from "express";
import { applyToJob, getMyApplications } from "../controllers/applications.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, requireRole(["CANDIDATE", "ADMIN"]), getMyApplications);
router.post("/jobs/:jobId", requireAuth, requireRole(["CANDIDATE", "ADMIN"]), applyToJob);

export default router;
