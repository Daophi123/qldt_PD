import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { ScheduleService } from "../services/schedule.service";
import { ApiResponse } from "../utils/apiResponse";

export class ScheduleController {
  public static getClassSchedule = catchAsync(async(req: AuthRequest, res: Response) => {
    const semesterCode = typeof req.query.semesterCode === 'string' ? req.query.semesterCode : undefined;
    const data = await ScheduleService.getClassSchedule(req.user!.id, semesterCode);
    res.status(200).json(new ApiResponse(200, "Lấy lịch học thành công", data));
  })
}