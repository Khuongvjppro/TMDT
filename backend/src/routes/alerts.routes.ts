import { Router } from "express";
import {
  createMyAlertRule,
  deleteMyAlertRule,
  listMyAlertNotifications,
  listMyAlertRules,
  markAllMyAlertNotificationsAsRead,
  markMyAlertNotificationAsRead,
  runAlertMatchingNow,
  updateMyAlertRule,
} from "../controllers/alerts.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE", "ADMIN"]));

router.get("/rules", listMyAlertRules);
router.post("/rules", createMyAlertRule);
router.patch("/rules/:id", updateMyAlertRule);
router.delete("/rules/:id", deleteMyAlertRule);

router.post("/run", runAlertMatchingNow);

router.get("/notifications", listMyAlertNotifications);
router.patch("/notifications/read-all", markAllMyAlertNotificationsAsRead);
router.patch("/notifications/:id/read", markMyAlertNotificationAsRead);

export default router;
