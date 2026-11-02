import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { AcademicService } from "../services/academic.service";

export class AcademicController {
  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await AcademicService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });
}
