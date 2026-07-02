import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import {
  categoryIdParamSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from "../validators/category.validator";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "../lib/api-response";

function getMeta(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  };
}

function requireAdmin(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return req.user;
}

export async function listCategories(req: Request, res: Response) {
  try {
    const parsed = listCategoriesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendValidationError(
        res,
        "Invalid query",
        parsed.error.flatten()
      );
    }

    const result = await categoryService.listCategories(parsed.data);
    return sendSuccess(res, {
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendError(res, error, "List categories error");
  }
}

export async function getCategory(req: Request, res: Response) {
  try {
    const parsedId = categoryIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid category id", parsedId.error.flatten());
    }

    const includeDeleted = req.query.includeDeleted === "true";
    const category = await categoryService.getCategoryById(
      parsedId.data,
      includeDeleted
    );

    return sendSuccess(res, { item: category });
  } catch (error) {
    return sendError(res, error, "Get category error");
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(
        res,
        "Invalid payload",
        parsed.error.flatten()
      );
    }

    const category = await categoryService.createCategory(
      parsed.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Category created successfully",
      item: category,
    });
  } catch (error) {
    return sendError(res, error, "Create category error");
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = categoryIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid category id", parsedId.error.flatten());
    }

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(
        res,
        "Invalid payload",
        parsed.error.flatten()
      );
    }

    const category = await categoryService.updateCategory(
      parsedId.data,
      parsed.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: "Category updated successfully",
      item: category,
    });
  } catch (error) {
    return sendError(res, error, "Update category error");
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = categoryIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid category id", parsedId.error.flatten());
    }

    const category = await categoryService.softDeleteCategory(
      parsedId.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: "Category deleted successfully",
      item: category,
    });
  } catch (error) {
    return sendError(res, error, "Delete category error");
  }
}
