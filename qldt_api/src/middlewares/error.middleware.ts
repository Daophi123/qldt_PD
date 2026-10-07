import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { environment } from "../config/environment";
import { ApiResponse } from "../utils/apiResponse";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  const isCustomError = err instanceof ApiError;
  const statusCode = isCustomError ? Number(err.statusCode) : 500;

  if(statusCode >= 500) {
    console.log(`${err.stack || err}`);
  }

  const message = isCustomError ? err.message : environment.NODE_ENV === "development" ? err.message : "Lỗi hệ thống. Vui lòng liên hệ quản trị viên";
  
  res.status(statusCode).json(new ApiResponse(statusCode, message, null));
}