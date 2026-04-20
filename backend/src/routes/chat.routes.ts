import { Router } from "express";
import {
  createConversation,
  listMyChatContacts,
  listConversationMessages,
  listMyConversations,
  sendConversationMessage,
} from "../controllers/chat.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE", "EMPLOYER"]));

router.get("/contacts", listMyChatContacts);
router.get("/conversations", listMyConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id/messages", listConversationMessages);
router.post("/conversations/:id/messages", sendConversationMessage);

export default router;
