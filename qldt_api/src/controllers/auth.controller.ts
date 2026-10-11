import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";

export class AuthController {
  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await AuthService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });

  public static login = catchAsync(async(req: Request, res: Response) => {
    const result = await AuthService.login(req.body.username, req.body.password);
    res.status(200).json(new ApiResponse(200, "Đăng nhập thành công", result));
  })

  public static getMe = catchAsync(async(req: AuthRequest, res: Response) => {
    res.status(200).json(new ApiResponse(200, "Lấy thông tin tài khoản thành công", req.user));
  })

  public static changePassword = catchAsync(async(req: AuthRequest, res: Response) => {
    await AuthService.changePassword(req.user!, req.body.oldPassword, req.body.newPassword);
    res.status(200).json(new ApiResponse(200, "Đổi mật khẩu thành công", null));
  })
}