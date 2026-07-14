import { Router } from "express";
import authRoutes from "./auth.routes";
import jobsRoutes from "./jobs.routes";
import applicationsRoutes from "./applications.routes";
import adminRoutes from "./admin.routes";
import employerRoutes from "./employer.routes";
import candidateRoutes from "./candidate.routes";
import chatRoutes from "./chat.routes";
import paymentRoutes from "./payment.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/admin", adminRoutes);
router.use("/employer", employerRoutes);
router.use("/candidate", candidateRoutes);
router.use("/chat", chatRoutes);
router.use("/payments", paymentRoutes);
router.use("/upload", uploadRoutes);

export default router;
