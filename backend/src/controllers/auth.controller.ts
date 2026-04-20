import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { REGISTER_ROLES, UserRole } from "../constants/enums";
import { ensureRoleProfile } from "../services/role-profile.service";

const REFRESH_TOKEN_COOKIE = "refreshToken";
const IS_PROD = process.env.NODE_ENV === "production";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(REGISTER_ROLES).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function toUserResponse(user: {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

function buildAuthResponse(user: {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}) {
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    accessToken,
    user: toUserResponse(user),
  };
}

function issueRefreshTokenCookie(res: Response, userId: number) {
  const refreshToken = signRefreshToken({ userId });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/api/auth",
  });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { fullName, email, password, role } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: role || "CANDIDATE",
    },
  });

  await ensureRoleProfile({
    userId: user.id,
    role: user.role,
    fullName: user.fullName,
  });

  issueRefreshTokenCookie(res, user.id);
  return res.status(201).json(buildAuthResponse(user));
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  issueRefreshTokenCookie(res, user.id);
  return res.status(200).json(buildAuthResponse(user));
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    issueRefreshTokenCookie(res, user.id);
    return res.status(200).json(buildAuthResponse(user));
  } catch {
    clearRefreshTokenCookie(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function logout(_req: Request, res: Response) {
  clearRefreshTokenCookie(res);
  return res.status(200).json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return res.status(200).json({ user });
}
