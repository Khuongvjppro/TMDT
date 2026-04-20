import { Router } from "express";
import {
  createMyCv,
  deleteMyCv,
  getMyCandidateProfile,
  listMyCvs,
  setDefaultMyCv,
  updateMyCandidateProfile,
  updateMyCv,
} from "../controllers/candidate.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE"]));

router.get("/profile", getMyCandidateProfile);
router.patch("/profile", updateMyCandidateProfile);

router.get("/cvs", listMyCvs);
router.post("/cvs", createMyCv);
router.patch("/cvs/:id", updateMyCv);
router.patch("/cvs/:id/default", setDefaultMyCv);
router.delete("/cvs/:id", deleteMyCv);

export default router;