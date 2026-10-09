import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { environment } from "../config/environment";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const isCustomError = err instanceof ApiError;
  const statusCode = isCustomError ? Number(err.statusCode) : 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  const message = isCustomError ? err.message : environment.NODE_ENV === "development" && err instanceof Error ? err.message : "Đã xảy ra lỗi trên hệ thống. Vui lòng liên hệ quản trị viên";

  res.status(statusCode).json(new ApiResponse(statusCode, message, null));
};