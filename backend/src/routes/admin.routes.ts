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
  getUserRoleStats,
  getUserStatusStats,
  getJobTypeStats,
  getApplicationStatusStats,
} from "../controllers/admin.controller";
import { requireAuth, requireRole, checkUserStatus } from "../middleware/auth";

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

// Chart stats
router.get(
  "/stats/user-roles",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getUserRoleStats
);

router.get(
  "/stats/user-statuses",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getUserStatusStats
);

router.get(
  "/stats/job-types",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getJobTypeStats
);

router.get(
  "/stats/application-statuses",
  requireAuth,
  checkUserStatus,
  requireRole(["ADMIN"]),
  getApplicationStatusStats
);

export default router;
