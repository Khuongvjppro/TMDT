import { Router } from "express";
import authRoutes from "./auth.routes";
import jobsRoutes from "./jobs.routes";
import applicationsRoutes from "./applications.routes";
import adminRoutes from "./admin.routes";
import candidateRoutes from "./candidate.routes";
import savedJobsRoutes from "./saved-jobs.routes";
import alertsRoutes from "./alerts.routes";
import chatRoutes from "./chat.routes";
import reviewsRoutes from "./reviews.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/admin", adminRoutes);
router.use("/candidate", candidateRoutes);
router.use("/saved-jobs", savedJobsRoutes);
router.use("/alerts", alertsRoutes);
router.use("/chat", chatRoutes);
router.use("/reviews", reviewsRoutes);

export default router;
