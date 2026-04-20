import { Router } from "express";
import employerRoutes from "../employer.routes";

const router = Router();

router.use("/employer", employerRoutes);

export default router;
