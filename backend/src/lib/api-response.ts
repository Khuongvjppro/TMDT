import { Response } from "express";
import { AppError } from "./errors";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface ApiSuccessBody<T = unknown> {
  success: true;
  message?: string;
  item?: T;
  items?: T[];
  pagination?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  details?: Record<string, unknown>;
  errors?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  options: {
    statusCode?: number;
    message?: string;
    item?: T;
    items?: T[];
    pagination?: PaginationMeta;
  }
) {
  const body: ApiSuccessBody<T> = { success: true };

  if (options.message) {
    body.message = options.message;
  }
  if (options.item !== undefined) {
    body.item = options.item;
  }
  if (options.items !== undefined) {
    body.items = options.items;
  }
  if (options.pagination) {
    body.pagination = options.pagination;
  }

  return res.status(options.statusCode ?? 200).json(body);
}

export function sendError(res: Response, error: unknown, logContext?: string) {
  if (error instanceof AppError) {
    const body: ApiErrorBody = {
      success: false,
      message: error.message,
    };
    if (error.details) {
      body.details = error.details;
    }
    return res.status(error.statusCode).json(body);
  }

  if (logContext) {
    console.error(`${logContext}:`, error);
  } else {
    console.error(error);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  } satisfies ApiErrorBody);
}

export function sendValidationError(
  res: Response,
  message: string,
  errors: unknown
) {
  return res.status(400).json({
    success: false,
    message,
    errors,
  } satisfies ApiErrorBody);
}
