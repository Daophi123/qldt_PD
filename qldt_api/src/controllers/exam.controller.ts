import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { ExamService } from "../services/exam.service";

export class ExamController {
  public static getExamSchedule = catchAsync(async(req: AuthRequest, res: Response) => {
    const semesterCode = typeof req.query.semesterCode === "string" ? req.query.semesterCode : undefined;
    const data = await ExamService.getExamSchedule(req.user!.id, semesterCode);
    res.status(200).json(new ApiResponse(200, "Lấy lịch thi thành công", data));
  });

  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await ExamService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });
}
