import { Request, Response } from "express";
import { z } from "zod";
import { USER_ROLES } from "../constants/enums";
import { prisma } from "../lib/prisma";
import { ensureRoleProfile } from "../services/role-profile.service";

const userIdParamSchema = z.coerce.number().int().positive();

const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { id: "asc" },
  });

  return res.status(200).json({ items: users });
}

export async function updateUserRole(req: Request, res: Response) {
  const userIdParsed = userIdParamSchema.safeParse(req.params.id);
  if (!userIdParsed.success) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const userId = userIdParsed.data;
  const parsed = updateUserRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  if (req.user && req.user.userId === userId && parsed.data.role !== "ADMIN") {
    return res
      .status(400)
      .json({ message: "Admin cannot remove own ADMIN role" });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  await ensureRoleProfile({
    userId: updated.id,
    role: updated.role,
    fullName: updated.fullName,
  });

  return res.status(200).json({ item: updated });
}
