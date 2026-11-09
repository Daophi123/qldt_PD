import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { ProgramService } from "../services/program.service";

export class ProgramController {
  public static getMyProgram = catchAsync(async(req: AuthRequest, res: Response) => {
    const data = await ProgramService.getMyProgram(req.user!.id);
    res.status(200).json(new ApiResponse(200, "Lấy chương trình học thành công", data));
  });

  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await ProgramService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });
}
