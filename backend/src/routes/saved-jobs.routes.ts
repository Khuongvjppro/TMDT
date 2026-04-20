import { Router } from "express";
import {
  getSavedJobStatus,
  listSavedJobs,
  saveJob,
  unsaveJob,
} from "../controllers/saved-jobs.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE"]));

router.get("/", listSavedJobs);
router.get("/:jobId/status", getSavedJobStatus);
router.post("/:jobId", saveJob);
router.delete("/:jobId", unsaveJob);

export default router;
