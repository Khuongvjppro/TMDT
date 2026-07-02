import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createCandidateCv,
  createJobAlert,
  deleteCandidateCv,
  deleteCompanyReview,
  deleteJobAlert,
  getCandidateProfile,
  getSavedJobStatus,
  listCandidateCvs,
  listCompanyReviews,
  listCompanies,
  listJobAlerts,
  listSavedJobs,
  runJobAlert,
  saveJob,
  unsaveJob,
  updateCandidateCv,
  updateCandidateProfile,
  updateJobAlert,
  upsertCompanyReview,
} from "../controllers/candidate.controller";

const router = Router();
router.use(requireAuth, requireRole(["CANDIDATE", "ADMIN"]));

router.get("/profile", getCandidateProfile);
router.patch("/profile", updateCandidateProfile);
router.get("/cvs", listCandidateCvs);
router.post("/cvs", createCandidateCv);
router.patch("/cvs/:id", updateCandidateCv);
router.delete("/cvs/:id", deleteCandidateCv);
router.get("/saved-jobs", listSavedJobs);
router.get("/saved-jobs/:jobId/status", getSavedJobStatus);
router.post("/saved-jobs/:jobId", saveJob);
router.delete("/saved-jobs/:jobId", unsaveJob);
router.get("/alerts", listJobAlerts);
router.post("/alerts", createJobAlert);
router.patch("/alerts/:id", updateJobAlert);
router.delete("/alerts/:id", deleteJobAlert);
router.post("/alerts/:id/run", runJobAlert);
router.get("/reviews", listCompanyReviews);
router.get("/companies", listCompanies);
router.put("/reviews/:employerId", upsertCompanyReview);
router.delete("/reviews/:employerId", deleteCompanyReview);

export default router;
