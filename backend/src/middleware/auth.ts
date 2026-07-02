import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { UserRole } from "../constants/enums";
import { prisma } from "../lib/prisma";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

export function checkUserStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check user status asynchronously but don't block
  // This will be called after requireAuth
  (async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { status: true },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.status === "LOCKED") {
        return res.status(403).json({ message: "Account is locked" });
      }

      if (user.status === "DELETED") {
        return res.status(403).json({ message: "Account has been deleted" });
      }

      next();
    } catch (error) {
      console.error("Error checking user status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })();
}
