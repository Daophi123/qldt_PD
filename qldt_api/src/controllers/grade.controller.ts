import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { GradeService } from "../services/grade.service";

export class GradeController {
  public static getMyGrades = catchAsync(async(req: AuthRequest, res: Response) => {
    const data = await GradeService.getMyGrades(req.user!.id);
    res.status(200).json(new ApiResponse(200, "Lấy bảng điểm thành công", data));
  });

  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await GradeService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });
}
