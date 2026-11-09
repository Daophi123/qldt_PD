import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { DocumentService } from "../services/document.service";

export class DocumentController {
  public static getDocuments = catchAsync(async(req: Request, res: Response) => {
    const data = await DocumentService.getDocuments(req.query);
    res.status(200).json(new ApiResponse(200, "Lấy danh sách văn bản thành công", data));
  });

  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await DocumentService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });
}