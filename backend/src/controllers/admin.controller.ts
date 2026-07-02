import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { adminUserManagementService } from "../services/admin-user-management.service";
import {
  listUsersQuerySchema,
  lockUserSchema,
  unlockUserSchema,
  softDeleteUserSchema,
  restoreUserSchema,
  updateUserRoleSchema,
  bulkUpdateUserRolesSchema,
  createUserSchema,
  userIdParamSchema,
} from "../validators/admin-user.validator";
import { ensureRoleProfile } from "../services/role-profile.service";
import {
  ValidationError,
  AuthorizationError,
  NotFoundError,
} from "../lib/errors";

export async function createUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: parsed.error.flatten(),
      });
    }

    const createdUser = await adminUserManagementService.createUser(
      parsed.data.fullName,
      parsed.data.email,
      parsed.data.password,
      parsed.data.role,
      parsed.data.invite,
      req.user.userId,
      req.ip,
      req.get("user-agent")
    );

    return res.status(201).json({
      message: parsed.data.invite ? "User invited successfully" : "User created successfully",
      item: createdUser,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const parsed = listUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: parsed.error.flatten(),
      });
    }

    const result = await adminUserManagementService.listUsers(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function lockUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdParsed = userIdParamSchema.safeParse(req.params);
    if (!userIdParsed.success) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const bodyParsed = lockUserSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: bodyParsed.error.flatten(),
      });
    }

    const updatedUser = await adminUserManagementService.lockUser(
      userIdParsed.data.id,
      req.user.userId,
      req.ip,
      req.get("user-agent")
    );

    return res.status(200).json({
      message: "User locked successfully",
      item: updatedUser,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Lock user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function unlockUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdParsed = userIdParamSchema.safeParse(req.params);
    if (!userIdParsed.success) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const bodyParsed = unlockUserSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: bodyParsed.error.flatten(),
      });
    }

    const updatedUser = await adminUserManagementService.unlockUser(
      userIdParsed.data.id,
      req.user.userId,
      req.ip,
      req.get("user-agent")
    );

    return res.status(200).json({
      message: "User unlocked successfully",
      item: updatedUser,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Unlock user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function softDeleteUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdParsed = userIdParamSchema.safeParse(req.params);
    if (!userIdParsed.success) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const bodyParsed = softDeleteUserSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: bodyParsed.error.flatten(),
      });
    }

    const deletedUser = await adminUserManagementService.softDeleteUser(
      userIdParsed.data.id,
      req.user.userId,
      bodyParsed.data.reason,
      req.ip,
      req.get("user-agent")
    );

    return res.status(200).json({
      message: "User deleted successfully",
      item: deletedUser,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Soft delete user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function restoreUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdParsed = userIdParamSchema.safeParse(req.params);
    if (!userIdParsed.success) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const bodyParsed = restoreUserSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: bodyParsed.error.flatten(),
      });
    }

    const restoredUser = await adminUserManagementService.restoreUser(
      userIdParsed.data.id,
      req.user.userId,
      bodyParsed.data.reason,
      req.ip,
      req.get("user-agent")
    );

    return res.status(200).json({
      message: "User restored successfully",
      item: restoredUser,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Restore user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdParsed = userIdParamSchema.safeParse(req.params);
    if (!userIdParsed.success) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const bodyParsed = updateUserRoleSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: bodyParsed.error.flatten(),
      });
    }

    if (
      req.user.userId === userIdParsed.data.id &&
      bodyParsed.data.role !== "ADMIN"
    ) {
      return res.status(403).json({
        message: "Admin cannot remove their own ADMIN role",
      });
    }

    const updatedUser = await adminUserManagementService.updateUserRole(
      userIdParsed.data.id,
      bodyParsed.data.role,
      req.user.userId,
      req.ip,
      req.get("user-agent")
    );

    // Ensure role profile exists
    await ensureRoleProfile({
      userId: updatedUser.id,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
    });

    return res.status(200).json({
      message: "User role updated successfully",
      item: updatedUser,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Update user role error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserRoles(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = bulkUpdateUserRolesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid payload",
        errors: parsed.error.flatten(),
      });
    }

    const updatedUsers = await adminUserManagementService.bulkUpdateUserRoles(
      parsed.data.userIds,
      parsed.data.role,
      req.user.userId,
      req.ip,
      req.get("user-agent")
    );

    return res.status(200).json({
      message: "User roles updated successfully",
      items: updatedUsers,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Update user roles error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserAuditLogs(req: Request, res: Response) {
  try {
    const userIdParsed = userIdParamSchema.safeParse(req.params);
    if (!userIdParsed.success) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const logs = await adminUserManagementService.getUserAuditLogs(
      userIdParsed.data.id
    );

    return res.status(200).json({
      items: logs,
    });
  } catch (error) {
    console.error("Get user audit logs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await adminUserManagementService.getAuditLogs({
      limit,
      offset,
      action: req.query.action as string,
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    const totalUsers = await prisma.user.count({ where: { NOT: { status: "DELETED" } } });
    const activeJobs = await prisma.job.count({
      where: { isActive: true, status: "APPROVED" },
    });
    const pendingJobs = await prisma.job.count({ where: { status: "PENDING" } });
    const totalApplications = await prisma.application.count();

    return res.status(200).json({
      users: totalUsers,
      jobs: activeJobs,
      pendingJobs,
      applications: totalApplications,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
