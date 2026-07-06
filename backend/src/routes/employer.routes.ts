import { Router } from "express";
import {
  deleteInterviewSchedule,
  getEmployerApplicationNotifications,
  getEmployerApplicationStatusStats,
  getEmployerInterviewModeStats,
  getEmployerJobTypeStats,
  getMyTransaction,
  getMyEmployerProfile,
  listBillingPackages,
  listApplicationsByJob,
  listCandidates,
  listMyJobs,
  listMyTransactions,
  upsertInterviewSchedule,
  updateApplicationStatus,
  updateMyEmployerProfile,
} from "../controllers/employer.controller";
import { createVnpayPayment } from "../controllers/payment.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/async-handler";

const router = Router();

router.use(requireAuth, requireRole(["EMPLOYER"]));

router.get("/profile", asyncHandler(getMyEmployerProfile));
router.patch("/profile", asyncHandler(updateMyEmployerProfile));
router.get("/billing/packages", asyncHandler(listBillingPackages));
router.post("/billing/purchase", asyncHandler(createVnpayPayment));
router.post("/billing/vnpay/create", asyncHandler(createVnpayPayment));
router.get("/transactions", asyncHandler(listMyTransactions));
router.get("/transactions/:transactionCode", asyncHandler(getMyTransaction));
router.get("/candidates", asyncHandler(listCandidates));
router.get("/jobs", asyncHandler(listMyJobs));
router.get("/stats/job-types", asyncHandler(getEmployerJobTypeStats));
router.get("/stats/application-statuses", asyncHandler(getEmployerApplicationStatusStats));
router.get("/stats/interview-modes", asyncHandler(getEmployerInterviewModeStats));
router.get("/notifications/applications", asyncHandler(getEmployerApplicationNotifications));
router.get("/jobs/:jobId/applications", asyncHandler(listApplicationsByJob));
router.patch("/applications/:applicationId/status", asyncHandler(updateApplicationStatus));
router.patch("/applications/:applicationId/interview", asyncHandler(upsertInterviewSchedule));
router.delete(
  "/applications/:applicationId/interview",
  asyncHandler(deleteInterviewSchedule),
);

export default router;
