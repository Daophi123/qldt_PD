import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { AcademicService } from "../services/academic.service";

export class AcademicController {
  public static getSemesters = catchAsync(async(_req: Request, res: Response) => {
    const data = await AcademicService.getSemesters();
    res.status(200).json(new ApiResponse(200, "Lấy danh sách học kỳ thành công", data));
  })

  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await AcademicService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });
}
