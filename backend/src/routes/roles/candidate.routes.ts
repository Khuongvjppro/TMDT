import { Router } from "express";
import applicationsRoutes from "../applications.routes";

const router = Router();

router.use("/applications", applicationsRoutes);

export default router;
