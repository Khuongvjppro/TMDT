import { prisma } from "../lib/prisma";
import { auditLogService } from "./audit-log.service";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import {
  CreatePackageInput,
  ListPackagesQuery,
  UpdatePackageInput,
} from "../validators/package.validator";

export interface PackageMeta {
  ipAddress?: string;
  userAgent?: string;
}

const packageSelect = {
  id: true,
  name: true,
  price: true,
  durationDays: true,
  maxJobPosts: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class PackageService {
  private async assertUniqueName(name: string, excludeId?: number) {
    const existing = await prisma.billingPackage.findFirst({
      where: {
        name,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictError("Package name already exists");
    }
  }

  async listPackages(query: ListPackagesQuery) {
    const { search, page, pageSize, includeInactive } = query;

    const where: Record<string, unknown> = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (search) {
      where.name = { contains: search };
    }

    const [items, total] = await Promise.all([
      prisma.billingPackage.findMany({
        where,
        select: packageSelect,
        orderBy: [{ price: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.billingPackage.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async getPackageById(id: number) {
    const pkg = await prisma.billingPackage.findUnique({
      where: { id },
      select: packageSelect,
    });

    if (!pkg) {
      throw new NotFoundError("Package");
    }

    return pkg;
  }

  async createPackage(
    input: CreatePackageInput,
    adminId: number,
    meta?: PackageMeta
  ) {
    const name = input.name.trim();
    if (!name) {
      throw new ValidationError("Package name is required");
    }

    await this.assertUniqueName(name);

    const pkg = await prisma.billingPackage.create({
      data: {
        name,
        price: input.price,
        durationDays: input.durationDays,
        maxJobPosts: input.maxJobPosts,
        isActive: input.isActive ?? true,
      },
      select: packageSelect,
    });

    await auditLogService.log({
      action: "PACKAGE_CREATED",
      userId: adminId,
      targetPackageId: pkg.id,
      details: {
        name: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
        maxJobPosts: pkg.maxJobPosts,
        isActive: pkg.isActive,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return pkg;
  }

  async updatePackage(
    id: number,
    input: UpdatePackageInput,
    adminId: number,
    meta?: PackageMeta
  ) {
    const existing = await this.getPackageById(id);

    const nextName = input.name?.trim();
    if (input.name !== undefined && !nextName) {
      throw new ValidationError("Package name cannot be empty");
    }

    if (nextName && nextName !== existing.name) {
      await this.assertUniqueName(nextName, id);
    }

    const pkg = await prisma.billingPackage.update({
      where: { id },
      data: {
        ...(nextName ? { name: nextName } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.durationDays !== undefined
          ? { durationDays: input.durationDays }
          : {}),
        ...(input.maxJobPosts !== undefined
          ? { maxJobPosts: input.maxJobPosts }
          : {}),
      },
      select: packageSelect,
    });

    await auditLogService.log({
      action: "PACKAGE_UPDATED",
      userId: adminId,
      targetPackageId: pkg.id,
      details: {
        previous: existing,
        current: pkg,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return pkg;
  }

  async setPackageStatus(
    id: number,
    isActive: boolean,
    adminId: number,
    meta?: PackageMeta
  ) {
    const existing = await this.getPackageById(id);

    if (existing.isActive === isActive) {
      throw new ConflictError(
        `Package is already ${isActive ? "enabled" : "disabled"}`
      );
    }

    const pkg = await prisma.billingPackage.update({
      where: { id },
      data: { isActive },
      select: packageSelect,
    });

    await auditLogService.log({
      action: "PACKAGE_STATUS_CHANGED",
      userId: adminId,
      targetPackageId: pkg.id,
      details: {
        name: pkg.name,
        previousStatus: existing.isActive,
        currentStatus: isActive,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return pkg;
  }

  async deletePackage(id: number, adminId: number, meta?: PackageMeta) {
    const existing = await this.getPackageById(id);

    const transactionCount = await prisma.employerTransaction.count({
      where: { packageId: id },
    });

    if (transactionCount > 0) {
      throw new ConflictError(
        "Cannot delete package with existing transactions. Disable it instead."
      );
    }

    await prisma.billingPackage.delete({ where: { id } });

    await auditLogService.log({
      action: "PACKAGE_DELETED",
      userId: adminId,
      targetPackageId: id,
      details: {
        name: existing.name,
        price: existing.price,
        durationDays: existing.durationDays,
        maxJobPosts: existing.maxJobPosts,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return existing;
  }
}

export const packageService = new PackageService();
