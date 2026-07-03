import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createConversation, listConversations, listMessages, sendMessage } from "../controllers/chat.controller";

const router = Router();
router.use(requireAuth, requireRole(["CANDIDATE", "EMPLOYER", "ADMIN"]));
router.get("/conversations", listConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id/messages", listMessages);
router.post("/conversations/:id/messages", sendMessage);

export default router;
