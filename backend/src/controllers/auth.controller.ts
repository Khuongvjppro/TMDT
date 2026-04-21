import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  signAccessToken,
  signEmailVerifyToken,
  signRefreshToken,
  verifyEmailVerifyToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { REGISTER_ROLES, UserRole } from "../constants/enums";
import { sendVerificationEmailReal } from "../services/email.service";
import { ensureRoleProfile } from "../services/role-profile.service";

const REFRESH_TOKEN_COOKIE = "refreshToken";
const IS_PROD = process.env.NODE_ENV === "production";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    role: z.enum(REGISTER_ROLES).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

function toUserResponse(user: {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerifiedAt?: Date | null;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isEmailVerified: Boolean(user.emailVerifiedAt),
  };
}

function buildAuthResponse(user: {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerifiedAt?: Date | null;
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

function buildVerificationLink(token: string) {
  return `${FRONTEND_ORIGIN}/verify-email?token=${encodeURIComponent(token)}`;
}

async function sendVerificationEmail(email: string, fullName: string, token: string) {
  const verifyLink = buildVerificationLink(token);
  await sendVerificationEmailReal({
    toEmail: email,
    fullName,
    verifyLink,
  });
  return verifyLink;
}

async function getEmailVerifiedAtByUserId(userId: number) {
  const rows = await prisma.$queryRaw<Array<{ emailVerifiedAt: Date | null }>>`
    SELECT emailVerifiedAt
    FROM \`User\`
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0]?.emailVerifiedAt ?? null;
}

async function getEmailVerifiedAtByEmail(email: string) {
  const rows = await prisma.$queryRaw<Array<{ emailVerifiedAt: Date | null }>>`
    SELECT emailVerifiedAt
    FROM \`User\`
    WHERE email = ${email}
    LIMIT 1
  `;

  return rows[0]?.emailVerifiedAt ?? null;
}

async function markEmailVerified(userId: number) {
  await prisma.$executeRaw`
    UPDATE \`User\`
    SET emailVerifiedAt = ${new Date()}
    WHERE id = ${userId}
  `;
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

  const verifyToken = signEmailVerifyToken({ userId: user.id, email: user.email });
  let verifyLink: string;
  try {
    verifyLink = await sendVerificationEmail(
      user.email,
      user.fullName,
      verifyToken,
    );
  } catch {
    return res.status(500).json({
      message:
        "Account created but failed to send verification email. Please try resend verification.",
    });
  }

  return res.status(201).json({
    message: "Registration successful. Please verify your email before login.",
    requiresEmailVerification: true,
    ...(IS_PROD
      ? {}
      : {
          devVerificationToken: verifyToken,
          devVerificationLink: verifyLink,
        }),
  });
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

  const emailVerifiedAt = await getEmailVerifiedAtByUserId(user.id);
  if (!emailVerifiedAt) {
    return res.status(403).json({
      message: "Email not verified",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  issueRefreshTokenCookie(res, user.id);
  return res.status(200).json(buildAuthResponse(user));
}

export async function verifyEmail(req: Request, res: Response) {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  try {
    const payload = verifyEmailVerifyToken(parsed.data.token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.email !== payload.email) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const emailVerifiedAt = await getEmailVerifiedAtByUserId(user.id);
    if (emailVerifiedAt) {
      return res.status(200).json({ message: "Email already verified" });
    }

    await markEmailVerified(user.id);
    return res.status(200).json({ message: "Email verified successfully" });
  } catch {
    return res.status(400).json({ message: "Invalid or expired verification token" });
  }
}

export async function resendVerificationEmail(req: Request, res: Response) {
  const parsed = resendVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  const emailVerifiedAt = await getEmailVerifiedAtByEmail(user.email);
  if (emailVerifiedAt) {
    return res.status(200).json({ message: "Email already verified" });
  }

  const verifyToken = signEmailVerifyToken({ userId: user.id, email: user.email });
  let verifyLink: string;
  try {
    verifyLink = await sendVerificationEmail(
      user.email,
      user.fullName,
      verifyToken,
    );
  } catch {
    return res.status(500).json({ message: "Failed to send verification email" });
  }

  return res.status(200).json({
    message: "Verification email sent",
    ...(IS_PROD
      ? {}
      : {
          devVerificationToken: verifyToken,
          devVerificationLink: verifyLink,
        }),
  });
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
