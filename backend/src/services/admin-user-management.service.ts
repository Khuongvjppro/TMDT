import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository, ListUsersQuery } from "../repositories/user.repository";
import { auditLogService } from "./audit-log.service";
import { sendInviteEmailReal } from "./email.service";
import { signResetPasswordToken } from "../lib/jwt";
import {
  ValidationError,
  AuthorizationError,
  NotFoundError,
} from "../lib/errors";


export class AdminUserManagementService {
  async listUsers(query: ListUsersQuery) {
    const result = await userRepository.listUsers(query);
    return result;
  }

  async createUser(
    fullName: string,
    email: string,
    password: string | undefined,
    role: UserRole,
    invite: boolean,
    adminId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError("Email already exists");
    }

    const effectivePassword = invite
      ? crypto.randomBytes(16).toString("hex")
      : password;

    if (!effectivePassword) {
      throw new ValidationError(
        "Password is required when not sending an invite"
      );
    }

    const passwordHash = await bcrypt.hash(effectivePassword, 10);
    const user = await userRepository.createUser({
      fullName,
      email,
      passwordHash,
      role,
      emailVerifiedAt: invite ? new Date() : undefined,
    });

    if (invite) {
      const inviteToken = signResetPasswordToken({
        userId: user.id,
        email: user.email,
      });
      const inviteLink = `${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}/invite?token=${encodeURIComponent(inviteToken)}`;

      await sendInviteEmailReal({
        toEmail: user.email,
        fullName: user.fullName,
        inviteLink,
      });

      await auditLogService.log({
        action: "USER_INVITED",
        userId: adminId,
        targetUserId: user.id,
        details: {
          userEmail: user.email,
          userRole: user.role,
        },
        ipAddress,
        userAgent,
      });

      return user;
    }

    await auditLogService.log({
      action: "USER_CREATED",
      userId: adminId,
      targetUserId: user.id,
      details: {
        userEmail: user.email,
        userRole: user.role,
      },
      ipAddress,
      userAgent,
    });

    return user;
  }

  async lockUser(
    userId: number,
    adminId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Prevent admin from locking themselves
    if (userId === adminId) {
      throw new AuthorizationError(
        "Admin cannot lock their own account"
      );
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.status === "LOCKED") {
      throw new ValidationError("User is already locked");
    }

    // Lock the user
    const updatedUser = await userRepository.lockUser(userId, adminId);

    // Audit log
    await auditLogService.log({
      action: "USER_LOCKED",
      userId: adminId,
      targetUserId: userId,
      details: {
        reason: "Admin action",
        userEmail: user.email,
      },
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async unlockUser(
    userId: number,
    adminId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.status !== "LOCKED") {
      throw new ValidationError("User is not locked");
    }

    // Unlock the user
    const updatedUser = await userRepository.unlockUser(userId);

    // Audit log
    await auditLogService.log({
      action: "USER_UNLOCKED",
      userId: adminId,
      targetUserId: userId,
      details: {
        userEmail: user.email,
        previousViolationCount: user.violationCount,
      },
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async softDeleteUser(
    userId: number,
    adminId: number,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Prevent admin from deleting themselves
    if (userId === adminId) {
      throw new AuthorizationError(
        "Admin cannot delete their own account"
      );
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.status === "DELETED") {
      throw new ValidationError("User is already deleted");
    }

    // Soft delete the user
    const deletedUser = await userRepository.softDeleteUser(userId);

    // Audit log
    await auditLogService.log({
      action: "USER_DELETED",
      userId: adminId,
      targetUserId: userId,
      details: {
        userEmail: user.email,
        reason: reason || "No reason provided",
        userRole: user.role,
      },
      ipAddress,
      userAgent,
    });

    return deletedUser;
  }

  async restoreUser(
    userId: number,
    adminId: number,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.status !== "DELETED") {
      throw new ValidationError("User is not deleted");
    }

    const restoredUser = await userRepository.restoreUser(userId);

    await auditLogService.log({
      action: "STATUS_CHANGED",
      userId: adminId,
      targetUserId: userId,
      details: {
        userEmail: user.email,
        oldStatus: "DELETED",
        newStatus: "ACTIVE",
        reason: reason || "No reason provided",
      },
      ipAddress,
      userAgent,
    });

    return restoredUser;
  }

  async updateUserRole(
    userId: number,
    newRole: UserRole,
    adminId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Prevent admin from removing their own admin role
    if (userId === adminId && newRole !== "ADMIN") {
      throw new AuthorizationError(
        "Admin cannot remove their own ADMIN role"
      );
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // Update role
    const { prisma } = await import("../lib/prisma");
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        violationCount: true,
        lockedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await auditLogService.log({
      action: "ROLE_CHANGED",
      userId: adminId,
      targetUserId: userId,
      details: {
        userEmail: user.email,
        oldRole: user.role,
        newRole,
      },
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async bulkUpdateUserRoles(
    userIds: number[],
    newRole: UserRole,
    adminId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (userIds.length === 0) {
      throw new ValidationError("No users selected for bulk role update");
    }

    if (userIds.includes(adminId) && newRole !== "ADMIN") {
      throw new AuthorizationError(
        "Admin cannot remove their own ADMIN role"
      );
    }

    const users = await Promise.all(
      userIds.map((id) => userRepository.findById(id))
    );

    const missing = users.filter((user) => !user);
    if (missing.length > 0) {
      throw new NotFoundError("One or more users");
    }

    const updatedUsers = await Promise.all(
      users.map((user) =>
        userRepository.updateUserRole(user!.id, newRole)
      )
    );

    await Promise.all(
      updatedUsers.map((updatedUser, index) =>
        auditLogService.log({
          action: "ROLE_CHANGED",
          userId: adminId,
          targetUserId: updatedUser.id,
          details: {
            userEmail: updatedUser.email,
            oldRole: users[index]!.role,
            newRole,
          },
          ipAddress,
          userAgent,
        })
      )
    );

    return updatedUsers;
  }

  async getUserAuditLogs(userId: number) {
    const logs = await auditLogService.getUserAuditLogs(userId);
    return logs;
  }

  async getAuditLogs(filters: any) {
    return auditLogService.getLogs(filters);
  }
}

export const adminUserManagementService =
  new AdminUserManagementService();
