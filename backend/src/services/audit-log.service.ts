import { prisma } from "../lib/prisma";
import { AuditActionType } from "../constants/enums";

export interface AuditLogData {
  action: AuditActionType;
  userId: number;
  targetUserId?: number;
  targetJobId?: number;
  targetCategoryId?: number;
  targetPackageId?: number;
  targetReviewId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogService {
  async log(data: AuditLogData) {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          targetUserId: data.targetUserId,
          targetJobId: data.targetJobId,
          targetCategoryId: data.targetCategoryId,
          targetPackageId: data.targetPackageId,
          targetReviewId: data.targetReviewId,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return auditLog;
    } catch (error) {
      // Log to external service if needed, but don't fail the request
      console.error("Failed to create audit log:", error);
    }
  }

  async getLogs(filters: {
    userId?: number;
    targetUserId?: number;
    action?: AuditActionType;
    limit?: number;
    offset?: number;
  }) {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const where: Record<string, any> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.targetUserId) {
      where.targetUserId = filters.targetUserId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          userId: true,
          user: { select: { id: true, email: true, fullName: true } },
          targetUserId: true,
          targetJobId: true,
          targetCategoryId: true,
          targetPackageId: true,
          targetReviewId: true,
          details: true,
          ipAddress: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs.map((log) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async getUserAuditLogs(userId: number, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { targetUserId: userId },
      select: {
        id: true,
        action: true,
        userId: true,
        user: { select: { id: true, email: true, fullName: true } },
        details: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const auditLogService = new AuditLogService();
