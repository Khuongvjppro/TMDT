import { Router } from "express";
import { listUsers, updateUserRole } from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/users", requireAuth, requireRole(["ADMIN"]), listUsers);
router.patch(
  "/users/:id/role",
  requireAuth,
  requireRole(["ADMIN"]),
  updateUserRole,
);

export default router;
