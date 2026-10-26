import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/apiResponse";
import { NewsService } from "../services/news.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export class NewsController {
  public static getDepartments = catchAsync(async(_req: Request, res: Response) => {
    const departments = await NewsService.getDepartments();
    res.status(200).json(new ApiResponse(200, "Lấy danh sách đơn vị thành công", departments));
  });

  public static getCategories = catchAsync(async(_req: Request, res: Response) => {
    const categories = await NewsService.getCategories();
    res.status(200).json(new ApiResponse(200, "Lấy danh sách chuyên mục thành công", categories));
  });

  public static createNews = catchAsync(async(req: AuthRequest, res: Response) => {
    const news = await NewsService.createNews({...req.body, authorId: req.user!.id, authorName: req.user!.fullName});
    res.status(201).json(new ApiResponse(201, "Tạo bản tin mới thành công", news));
  });

  public static updateNews = catchAsync(async(req: Request, res: Response) => {
    const id = getParamId(req.params.id);
    const updated = await NewsService.updateNews(id, req.body);
    res.status(200).json(new ApiResponse(200, "Cập nhật bản tin thành công", updated));
  });

  public static deleteNews = catchAsync(async(req: Request, res: Response) => {
    const id = getParamId(req.params.id);
    await NewsService.deleteNews(id);
    res.status(200).json(new ApiResponse(200, "Xóa bản tin thành công", null));
  });

  public static seedData = catchAsync(async(_req: Request, res: Response) => {
    const result = await NewsService.seedInitialData();
    res.status(200).json(new ApiResponse(200, result.message, result));
  });

  public static getNewsList = catchAsync(async(req: Request, res: Response) => {
    const result = await NewsService.getNewsList(req.query);
    res.status(200).json(new ApiResponse(200, "Lấy danh sách tin tức thành công", result));
  });

  public static getGroupedNews = catchAsync(async(req: Request, res: Response) => {
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
    const keyword = typeof req.query.keyword === "string" ? req.query.keyword : undefined;
    const data = await NewsService.getGroupedNews(departmentId, keyword);
    res.status(200).json(new ApiResponse(200, "Lấy danh sách tin tức theo nhóm thành công", data));
  });

  public static getNewsDetail = catchAsync(async(req: Request, res: Response) => {
    const id = getParamId(req.params.id);
    const news = await NewsService.getNewsById(id);
    res.status(200).json(new ApiResponse(200, "Lấy chi tiết tin tức thành công", news));
  });

  public static getComments = catchAsync(async(req: Request, res: Response) => {
    const id = getParamId(req.params.id);
    const comments = await NewsService.getComments(id);
    res.status(200).json(new ApiResponse(200, "Lấy danh sách bình luận thành công", comments));
  });

  public static createComment = catchAsync(async(req: AuthRequest, res: Response) => {
    const id = getParamId(req.params.id);
    const comment = await NewsService.addComment(id, { content: req.body.content, userId: req.user!.id, authorName: req.user!.fullName });
    res.status(201).json(new ApiResponse(201, "Gửi ý kiến cá nhân thành công", comment));
  });

  public static addBookmark = catchAsync(async(req: AuthRequest, res: Response) => {
    const id = getParamId(req.params.id);
    const bookmark = await NewsService.addBookmark(id, req.user!.id);
    res.status(200).json(new ApiResponse(200, "Lưu bản tin thành công", bookmark));
  });

  public static removeBookmark = catchAsync(async(req: AuthRequest, res: Response) => {
    const id = getParamId(req.params.id);
    await NewsService.removeBookmark(id, req.user!.id);
    res.status(200).json(new ApiResponse(200, "Đã bỏ lưu bản tin", null));
  });

  public static checkBookmark = catchAsync(async(req: AuthRequest, res: Response) => {
    const id = getParamId(req.params.id);
    const isBookmarked = await NewsService.checkBookmark(id, req.user!.id);
    res.status(200).json(new ApiResponse(200, "Kiểm tra trạng thái đánh dấu thành công", { isBookmarked }));
  });

  public static getBookmarks = catchAsync(async(req: AuthRequest, res: Response) => {
    const bookmarks = await NewsService.getBookmarks(req.user!.id);
    res.status(200).json(new ApiResponse(200, "Lấy danh sách tin đã lưu thành công", bookmarks));
  });
}
