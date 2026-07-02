import { prisma } from "../lib/prisma";
import { UserStatus } from "../constants/enums";

export interface ListUsersQuery {
  search?: string; // email or name
  role?: string;
  status?: UserStatus;
  sortBy?: "createdAt" | "violationCount" | "role";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface UserWithStatus {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: UserStatus;
  violationCount: number;
  lockedAt: Date | null;
  lockedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  async findById(id: number): Promise<UserWithStatus | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        violationCount: true,
        lockedAt: true,
        lockedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<UserWithStatus | null>;
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUserRole(userId: number, newRole: string) {
    return prisma.user.update({
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
        lockedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(input: {
    fullName: string;
    email: string;
    passwordHash: string;
    role: string;
    emailVerifiedAt?: Date | null;
  }) {
    return prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        status: "ACTIVE",
        emailVerifiedAt: input.emailVerifiedAt ?? null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        violationCount: true,
        lockedAt: true,
        lockedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listUsers(query: ListUsersQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Record<string, any> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search } },
        { fullName: { contains: query.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          violationCount: true,
          lockedAt: true,
          lockedBy: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder || (query.sortBy === "role" ? "asc" : "desc") }
          : { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users as UserWithStatus[],
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  async lockUser(userId: number, lockedBy: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: "LOCKED",
        lockedAt: new Date(),
        lockedBy,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        violationCount: true,
        lockedAt: true,
        lockedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async unlockUser(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        lockedAt: null,
        lockedBy: null,
        violationCount: 0,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        violationCount: true,
        lockedAt: true,
        lockedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteUser(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
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
  }

  async restoreUser(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        deletedAt: null,
      },
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
  }

  async incrementViolationCount(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        violationCount: { increment: 1 },
      },
    });
  }

  async getUserStatus(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        status: true,
        violationCount: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
