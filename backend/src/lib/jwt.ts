import jwt from "jsonwebtoken";
import { UserRole } from "../constants/enums";

const BASE_SECRET = process.env.JWT_SECRET || "replace_with_secure_secret";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || BASE_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || BASE_SECRET;
const JWT_EMAIL_VERIFY_SECRET =
  process.env.JWT_EMAIL_VERIFY_SECRET || BASE_SECRET;
const JWT_RESET_PASSWORD_SECRET =
  process.env.JWT_RESET_PASSWORD_SECRET || BASE_SECRET;
const ACCESS_TOKEN_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
  "15m";
const REFRESH_TOKEN_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
  "7d";
const EMAIL_VERIFY_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_EMAIL_VERIFY_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
  "1h";
const RESET_PASSWORD_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_RESET_PASSWORD_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
  "15m";

export type AccessTokenPayload = {
  userId: number;
  role: UserRole;
  email: string;
  tokenType: "access";
};

export type RefreshTokenPayload = {
  userId: number;
  tokenType: "refresh";
};

export type EmailVerifyTokenPayload = {
  userId: number;
  email: string;
  tokenType: "email_verify";
};

export type ResetPasswordTokenPayload = {
  userId: number;
  email: string;
  tokenType: "reset_password";
};

export function signAccessToken(payload: {
  userId: number;
  role: UserRole;
  email: string;
}): string {
  const data: AccessTokenPayload = {
    ...payload,
    tokenType: "access",
  };

  return jwt.sign(data, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function signRefreshToken(payload: { userId: number }): string {
  const data: RefreshTokenPayload = {
    ...payload,
    tokenType: "refresh",
  };

  return jwt.sign(data, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (decoded.tokenType !== "access") {
    throw new Error("Invalid access token");
  }
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (decoded.tokenType !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return decoded;
}

export function signEmailVerifyToken(payload: {
  userId: number;
  email: string;
}): string {
  const data: EmailVerifyTokenPayload = {
    ...payload,
    tokenType: "email_verify",
  };

  return jwt.sign(data, JWT_EMAIL_VERIFY_SECRET, {
    expiresIn: EMAIL_VERIFY_EXPIRES_IN,
  });
}

export function verifyEmailVerifyToken(token: string): EmailVerifyTokenPayload {
  const decoded = jwt.verify(
    token,
    JWT_EMAIL_VERIFY_SECRET,
  ) as EmailVerifyTokenPayload;
  if (decoded.tokenType !== "email_verify") {
    throw new Error("Invalid email verification token");
  }
  return decoded;
}

export function signResetPasswordToken(payload: {
  userId: number;
  email: string;
}): string {
  const data: ResetPasswordTokenPayload = {
    ...payload,
    tokenType: "reset_password",
  };

  return jwt.sign(data, JWT_RESET_PASSWORD_SECRET, {
    expiresIn: RESET_PASSWORD_EXPIRES_IN,
  });
}

export function verifyResetPasswordToken(token: string): ResetPasswordTokenPayload {
  const decoded = jwt.verify(
    token,
    JWT_RESET_PASSWORD_SECRET,
  ) as ResetPasswordTokenPayload;

  if (decoded.tokenType !== "reset_password") {
    throw new Error("Invalid reset password token");
  }

  return decoded;
}
