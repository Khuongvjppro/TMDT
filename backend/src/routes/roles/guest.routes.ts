import { Router } from "express";
import authRoutes from "../auth.routes";
import jobsRoutes from "../jobs.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);

export default router;
