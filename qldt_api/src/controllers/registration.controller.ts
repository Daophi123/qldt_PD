import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { RegistrationService } from "../services/registration.service";

const getSemesterCode = (req: AuthRequest) => typeof req.query.semesterCode === "string" ? req.query.semesterCode : undefined;

export class RegistrationController {
  public static getOverview = catchAsync(async(req: AuthRequest, res: Response) => {
    const data = await RegistrationService.getOverview(req.user!.id, getSemesterCode(req));
    res.status(200).json(new ApiResponse(200, "Lấy danh sách học phần mở đăng ký thành công", data));
  });

  public static getHistory = catchAsync(async(req: AuthRequest, res: Response) => {
    const data = await RegistrationService.getHistory(req.user!.id, getSemesterCode(req));
    res.status(200).json(new ApiResponse(200, "Lấy kết quả đăng ký thành công", data));
  });

  public static register = catchAsync(async(req: AuthRequest, res: Response) => {
    const data = await RegistrationService.register(req.user!.id, req.body.classSectionId);
    res.status(201).json(new ApiResponse(201, `Đã đăng ký lớp ${data.classSectionCode}`, data));
  });

  public static cancel = catchAsync(async(req: AuthRequest, res: Response) => {
    const data = await RegistrationService.cancel(req.user!.id, String(req.params.enrollmentId));
    res.status(200).json(new ApiResponse(200, `Đã huỷ lớp ${data.classSectionCode}`, data));
  });
}
