import { prisma } from "../lib/prisma";
import { auditLogService } from "./audit-log.service";
import { generateUniqueSlug } from "../lib/slug";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "../validators/category.validator";

export interface CategoryMeta {
  ipAddress?: string;
  userAgent?: string;
}

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class CategoryService {
  private async assertUniqueName(name: string, excludeId?: number) {
    const existing = await prisma.category.findFirst({
      where: {
        name,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictError("Category name already exists");
    }
  }

  private async isSlugTaken(slug: string, excludeId?: number) {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async listCategories(query: ListCategoriesQuery) {
    const { search, page, pageSize, includeDeleted } = query;

    const where: Record<string, unknown> = {};
    if (!includeDeleted) {
      where.isDeleted = false;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        select: categorySelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.category.count({ where }),
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

  async getCategoryById(id: number, includeDeleted = false) {
    const category = await prisma.category.findUnique({
      where: { id },
      select: categorySelect,
    });

    if (!category || (!includeDeleted && category.isDeleted)) {
      throw new NotFoundError("Category");
    }

    return category;
  }

  async createCategory(
    input: CreateCategoryInput,
    adminId: number,
    meta?: CategoryMeta
  ) {
    const name = input.name.trim();
    if (!name) {
      throw new ValidationError("Category name is required");
    }

    await this.assertUniqueName(name);

    const slug = await generateUniqueSlug(name, (candidate) =>
      this.isSlugTaken(candidate)
    );

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
      },
      select: categorySelect,
    });

    await auditLogService.log({
      action: "CATEGORY_CREATED",
      userId: adminId,
      targetCategoryId: category.id,
      details: {
        name: category.name,
        slug: category.slug,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return category;
  }

  async updateCategory(
    id: number,
    input: UpdateCategoryInput,
    adminId: number,
    meta?: CategoryMeta
  ) {
    const existing = await this.getCategoryById(id);

    const nextName = input.name?.trim();
    if (input.name !== undefined && !nextName) {
      throw new ValidationError("Category name cannot be empty");
    }

    if (nextName && nextName !== existing.name) {
      await this.assertUniqueName(nextName, id);
    }

    let slug = existing.slug;
    if (nextName && nextName !== existing.name) {
      slug = await generateUniqueSlug(nextName, (candidate) =>
        this.isSlugTaken(candidate, id)
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(nextName ? { name: nextName, slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
      },
      select: categorySelect,
    });

    await auditLogService.log({
      action: "CATEGORY_UPDATED",
      userId: adminId,
      targetCategoryId: category.id,
      details: {
        previous: {
          name: existing.name,
          slug: existing.slug,
          description: existing.description,
        },
        current: {
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return category;
  }

  async softDeleteCategory(id: number, adminId: number, meta?: CategoryMeta) {
    const existing = await this.getCategoryById(id);

    if (existing.isDeleted) {
      throw new ConflictError("Category is already deleted");
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isDeleted: true },
      select: categorySelect,
    });

    await auditLogService.log({
      action: "CATEGORY_DELETED",
      userId: adminId,
      targetCategoryId: category.id,
      details: {
        name: category.name,
        slug: category.slug,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return category;
  }
}

export const categoryService = new CategoryService();
