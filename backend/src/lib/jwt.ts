import jwt from "jsonwebtoken";
import { UserRole } from "../constants/enums";

const BASE_SECRET = process.env.JWT_SECRET || "replace_with_secure_secret";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || BASE_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || BASE_SECRET;
const ACCESS_TOKEN_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
  "15m";
const REFRESH_TOKEN_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
  "7d";

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
