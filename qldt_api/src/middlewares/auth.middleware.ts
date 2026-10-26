import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user/user.model";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/apiError";
import { AuthService } from "../services/auth.service";

export interface AuthRequest extends Request {
  user?: UserModel;
}

export const authenticate = catchAsync(async(req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if(!header || !header.startsWith("Bearer ")) {
    throw new ApiError("401", "Bạn chưa đăng nhập");
  }

  const userId = AuthService.verifyToken(header.slice("Bearer ".length));
  const user = await UserModel.findByPk(userId);
  if(!user || !user.isActive) {
    throw new ApiError("401", "Tài khoản không tồn tại hoặc đã bị khóa");
  }
  req.user = user;
  next();
});

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if(!req.user || !roles.includes(req.user.role)) {
      next(new ApiError("403", "Bạn không có quyền thực hiện thao tác này"));
      return;
    }
    next();
  };
};