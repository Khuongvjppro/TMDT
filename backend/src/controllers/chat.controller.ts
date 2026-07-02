import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const idSchema = z.coerce.number().int().positive();
const createConversationSchema = z.object({ employerId: z.coerce.number().int().positive() });
const messageSchema = z.object({ content: z.string().trim().min(1).max(5000) });

function currentUser(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return req.user;
}

function participantWhere(user: { userId: number; role: string }) {
  if (user.role === "EMPLOYER") return { employerId: user.userId };
  if (user.role === "CANDIDATE") return { candidateId: user.userId };
  return {};
}

export async function listConversations(req: Request, res: Response) {
  const user = currentUser(req, res);
  if (!user) return;
  const items = await prisma.conversation.findMany({
    where: participantWhere(user),
    include: {
      candidate: { select: { id: true, fullName: true, email: true } },
      employer: { select: { id: true, fullName: true, email: true, employerProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return res.status(200).json({ items });
}

export async function createConversation(req: Request, res: Response) {
  const user = currentUser(req, res);
  if (!user) return;
  if (user.role !== "CANDIDATE" && user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only candidates can start a conversation" });
  }
  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid employer" });
  const employer = await prisma.user.findFirst({ where: { id: parsed.data.employerId, role: "EMPLOYER" } });
  if (!employer) return res.status(404).json({ message: "Employer not found" });

  const item = await prisma.conversation.upsert({
    where: { candidateId_employerId: { candidateId: user.userId, employerId: employer.id } },
    update: { updatedAt: new Date() },
    create: { candidateId: user.userId, employerId: employer.id },
    include: { employer: { select: { id: true, fullName: true, employerProfile: true } } },
  });
  return res.status(201).json({ item });
}

async function findAuthorizedConversation(conversationId: number, user: { userId: number; role: string }) {
  const item = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!item) return null;
  if (user.role === "ADMIN" || item.candidateId === user.userId || item.employerId === user.userId) return item;
  return null;
}

export async function listMessages(req: Request, res: Response) {
  const user = currentUser(req, res);
  if (!user) return;
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ message: "Invalid conversation id" });
  const conversation = await findAuthorizedConversation(id.data, user);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });

  await prisma.chatMessage.updateMany({
    where: { conversationId: conversation.id, senderId: { not: user.userId }, readAt: null },
    data: { readAt: new Date() },
  });
  const items = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    include: { sender: { select: { id: true, fullName: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return res.status(200).json({ items });
}

export async function sendMessage(req: Request, res: Response) {
  const user = currentUser(req, res);
  if (!user) return;
  const id = idSchema.safeParse(req.params.id);
  const parsed = messageSchema.safeParse(req.body);
  if (!id.success || !parsed.success) return res.status(400).json({ message: "Invalid message" });
  const conversation = await findAuthorizedConversation(id.data, user);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({
      data: { conversationId: conversation.id, senderId: user.userId, content: parsed.data.content },
      include: { sender: { select: { id: true, fullName: true, role: true } } },
    });
    await tx.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    return created;
  });
  return res.status(201).json({ item });
}
