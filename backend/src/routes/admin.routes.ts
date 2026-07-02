import { Router } from "express";
import {
  createUser,
  listUsers,
  updateUserRole,
  updateUserRoles,
  lockUser,
  unlockUser,
  softDeleteUser,
  restoreUser,
  getUserAuditLogs,
  getAuditLogs,
  getStats,
} from "../controllers/admin.controller";
import { requireAuth, requireRole, checkUserStatus } from "../middleware/auth";
import {
  getModerationQueue,
  approveJob,
  rejectJob
} from "../controllers/moderation.controller";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";


const router = Router();

// User Management Routes
router.post(
  "/users",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  createUser
);

router.get(
  "/users",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  listUsers
);

router.patch(
  "/users/:id/role",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  updateUserRole
);

router.patch(
  "/users/roles",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  updateUserRoles
);

router.post(
  "/users/:id/lock",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  lockUser
);

router.post(
  "/users/:id/unlock",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  unlockUser
);

router.delete(
  "/users/:id",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  softDeleteUser
);

router.post(
  "/users/:id/restore",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  restoreUser
);

// Audit Logs Routes
router.get(
  "/users/:id/audit-logs",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getUserAuditLogs
);

router.get(
  "/audit-logs",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getAuditLogs
);

// Dashboard stats
router.get(
  "/stats",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getStats

);

//Moderation Routes
router.get(
  "/moderation",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getModerationQueue
);

router.post(
  "/moderation/:id/approve",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  approveJob
);

router.post(
  "/moderation/:id/reject",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  rejectJob
);

// Category Management Routes
router.get(
  "/categories",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  listCategories
);

router.get(
  "/categories/:id",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getCategory
);

router.post(
  "/categories",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  createCategory
);

router.patch(
  "/categories/:id",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  updateCategory
);

router.delete(
  "/categories/:id",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  deleteCategory
);

export default router;
