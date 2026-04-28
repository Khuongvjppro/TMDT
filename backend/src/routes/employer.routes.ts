import { Router } from "express";
import {
  deleteInterviewSchedule,
  getMyEmployerProfile,
  listBillingPackages,
  listApplicationsByJob,
  listCandidates,
  listMyJobs,
  listMyTransactions,
  purchaseBillingPackage,
  upsertInterviewSchedule,
  updateApplicationStatus,
  updateMyEmployerProfile,
} from "../controllers/employer.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["EMPLOYER"]));

router.get("/profile", getMyEmployerProfile);
router.patch("/profile", updateMyEmployerProfile);
router.get("/billing/packages", listBillingPackages);
router.post("/billing/purchase", purchaseBillingPackage);
router.get("/transactions", listMyTransactions);
router.get("/candidates", listCandidates);
router.get("/jobs", listMyJobs);
router.get("/jobs/:jobId/applications", listApplicationsByJob);
router.patch("/applications/:applicationId/status", updateApplicationStatus);
router.patch("/applications/:applicationId/interview", upsertInterviewSchedule);
router.delete(
  "/applications/:applicationId/interview",
  deleteInterviewSchedule,
);

export default router;
