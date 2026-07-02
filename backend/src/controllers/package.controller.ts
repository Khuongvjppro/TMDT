import { Request, Response } from "express";
import { packageService } from "../services/package.service";
import {
  createPackageSchema,
  listPackagesQuerySchema,
  packageIdParamSchema,
  setPackageStatusSchema,
  updatePackageSchema,
} from "../validators/package.validator";
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

export async function listPackages(req: Request, res: Response) {
  try {
    const parsed = listPackagesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid query", parsed.error.flatten());
    }

    const result = await packageService.listPackages(parsed.data);
    return sendSuccess(res, {
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendError(res, error, "List packages error");
  }
}

export async function getPackage(req: Request, res: Response) {
  try {
    const parsedId = packageIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid package id", parsedId.error.flatten());
    }

    const pkg = await packageService.getPackageById(parsedId.data);
    return sendSuccess(res, { item: pkg });
  } catch (error) {
    return sendError(res, error, "Get package error");
  }
}

export async function createPackage(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsed = createPackageSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid payload", parsed.error.flatten());
    }

    const pkg = await packageService.createPackage(
      parsed.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Package created successfully",
      item: pkg,
    });
  } catch (error) {
    return sendError(res, error, "Create package error");
  }
}

export async function updatePackage(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = packageIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid package id", parsedId.error.flatten());
    }

    const parsed = updatePackageSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid payload", parsed.error.flatten());
    }

    const pkg = await packageService.updatePackage(
      parsedId.data,
      parsed.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: "Package updated successfully",
      item: pkg,
    });
  } catch (error) {
    return sendError(res, error, "Update package error");
  }
}

export async function setPackageStatus(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = packageIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid package id", parsedId.error.flatten());
    }

    const parsed = setPackageStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, "Invalid payload", parsed.error.flatten());
    }

    const pkg = await packageService.setPackageStatus(
      parsedId.data,
      parsed.data.isActive,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: parsed.data.isActive
        ? "Package enabled successfully"
        : "Package disabled successfully",
      item: pkg,
    });
  } catch (error) {
    return sendError(res, error, "Set package status error");
  }
}

export async function deletePackage(req: Request, res: Response) {
  try {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsedId = packageIdParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return sendValidationError(res, "Invalid package id", parsedId.error.flatten());
    }

    const pkg = await packageService.deletePackage(
      parsedId.data,
      admin.userId,
      getMeta(req)
    );

    return sendSuccess(res, {
      message: "Package deleted successfully",
      item: pkg,
    });
  } catch (error) {
    return sendError(res, error, "Delete package error");
  }
}
