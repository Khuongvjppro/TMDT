import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { uploadCv as uploadCvMiddleware } from "../middleware/upload";
import { uploadCvFile, deleteCvFile } from "../controllers/upload.controller";

const router = Router();
router.use(requireAuth);

// POST /api/upload/cv — upload a CV file to Cloudinary
router.post("/cv", uploadCvMiddleware.single("file"), uploadCvFile);

// DELETE /api/upload/cv — delete a CV file from Cloudinary
router.delete("/cv", deleteCvFile);

export default router;
