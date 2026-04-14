import jwt from "jsonwebtoken";
import { UserRole } from "../constants/enums";

const JWT_SECRET = process.env.JWT_SECRET || "replace_with_secure_secret";

export type JwtPayload = {
  userId: number;
  role: UserRole;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
