import { CookieOptions, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/auth.middleware";
import { environment } from "../config/environment";

const REFRESH_COOKIE = "refreshToken";
const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: environment.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth"
}

const refreshCookieMaxAge = environment.REFRESH_TOKEN_EXPRIRES_DAYS * 24 * 60 * 60 * 1000;

export class AuthController {
  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await AuthService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });

  public static login = catchAsync(async(req: Request, res: Response) => {
    const { refreshToken, ...result } = await AuthService.login(req.body.username, req.body.password);
    res.cookie(REFRESH_COOKIE, refreshToken, { ...refreshCookieOptions, maxAge: refreshCookieMaxAge });
    res.status(200).json(new ApiResponse(200, "Đăng nhập thành công", result));
  })

  public static refresh = catchAsync(async(req: Request, res: Response) => {
    const { refreshToken, token } = await AuthService.refresh(req.cookies[REFRESH_COOKIE]);
    res.cookie(REFRESH_COOKIE, refreshToken, { ...refreshCookieOptions, maxAge: refreshCookieMaxAge });
    res.status(200).json(new ApiResponse(200, "Làm mới phiên đăng nhập thành công", { token }));
  })

  public static logout = catchAsync(async(req: Request, res: Response) => {
    await AuthService.logout(req.cookies[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    res.status(200).json(new ApiResponse(200, "Đăng xuất thành công", null));
  })

  public static getMe = catchAsync(async(req: AuthRequest, res: Response) => {
    res.status(200).json(new ApiResponse(200, "Lấy thông tin tài khoản thành công", req.user));
  })

  public static changePassword = catchAsync(async(req: AuthRequest, res: Response) => {
    await AuthService.changePassword(req.user!, req.body.oldPassword, req.body.newPassword);
    res.status(200).json(new ApiResponse(200, "Đổi mật khẩu thành công", null));
  })
}