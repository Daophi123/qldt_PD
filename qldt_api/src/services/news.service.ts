import { Op, WhereOptions } from "sequelize";
import {
  CategoryModel,
  DepartmentModel,
  NewsModel,
  AttachmentModel,
  CommentModel,
  BookMarkModel,
} from "../models";
import { ApiError } from "../utils/apiError";

interface NewsFilterQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  departmentId?: string;
  categoryCode?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isPinned?: boolean;
}

interface CreateNewsPayload {
  title: string;
  summary?: string;
  content: string;
  categoryId: string;
  departmentId: string;
  startDate: string;
  endDate?: string;
  authorId?: string;
  authorName?: string;
  thumbnailUrl?: string;
  isPinned?: boolean;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
  }>;
}

export class NewsService {
  public static async getDepartments() {
    return await DepartmentModel.findAll({
      where: { isActive: true },
      order: [["order", "ASC"]],
    });
  }

  public static async getCategories() {
    return await CategoryModel.findAll({
      order: [["order", "ASC"]],
    });
  }

  public static async createNews(payload: CreateNewsPayload) {
    const category = await CategoryModel.findByPk(payload.categoryId);
    if(!category) {
      throw new ApiError("404", "Chuyên mục tin tức không tồn tại");
    }

    const department = await DepartmentModel.findByPk(payload.departmentId);
    if(!department) {
      throw new ApiError("404", "Phòng ban / đơn vị ban hành không tồn tại");
    }

    const news = await NewsModel.create({
      title: payload.title,
      summary: payload.summary,
      content: payload.content,
      categoryId: payload.categoryId,
      departmentId: payload.departmentId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      authorId: payload.authorId,
      authorName: payload.authorName,
      thumbnailUrl: payload.thumbnailUrl,
      isPinned: payload.isPinned ?? false,
      isActive: true,
      views: 0,
    });

    if(payload.attachments && payload.attachments.length > 0) {
      const attachmentsData = payload.attachments.map((att) => ({
        newsId: news.id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        fileType: att.fileType,
      }));
      await AttachmentModel.bulkCreate(attachmentsData);
    }

    return await this.getNewsById(news.id);
  }

  public static async updateNews(id: string, payload: Record<string, unknown>) {
    const news = await NewsModel.findByPk(id);
    if(!news) {
      throw new ApiError("404", "Không tìm thấy bản tin để cập nhật");
    }
    await news.update(payload);
    return await this.getNewsById(id);
  }

  public static async deleteNews(id: string) {
    const news = await NewsModel.findByPk(id);
    if(!news) {
      throw new ApiError("404", "Không tìm thấy bản tin để xóa");
    }
    await AttachmentModel.destroy({ where: { newsId: id } });
    await CommentModel.destroy({ where: { newsId: id } });
    await BookMarkModel.destroy({ where: { newsId: id } });
    await news.destroy();
    return true;
  }

  public static async getNewsList(query: NewsFilterQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;
    const where: Record<string | symbol, unknown> = { isActive: true };

    if(query.departmentId) where["departmentId"] = query.departmentId;
    if(query.categoryId) where["categoryId"] = query.categoryId;
    if(typeof query.isPinned === "boolean") where["isPinned"] = query.isPinned;

    if(query.keyword && query.keyword.trim().length > 0) {
      const kw = `%${query.keyword.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: kw } },
        { content: { [Op.like]: kw } },
      ];
    }
    if(query.startDate && query.endDate) {
      where["startDate"] = { [Op.between]: [query.startDate, query.endDate] };
    } else if(query.startDate) {
      where["startDate"] = { [Op.gte]: query.startDate };
    } else if(query.endDate) {
      where["endDate"] = { [Op.lte]: query.endDate };
    }

    const categoryWhere: Record<string, unknown> = {};
    if (query.categoryCode) {
      categoryWhere["code"] = query.categoryCode;
    }

    const { count, rows } = await NewsModel.findAndCountAll({
      where: where as WhereOptions,
      include: [
        { model: DepartmentModel, as: "department", attributes: ["id", "code", "name"] },
        {
          model: CategoryModel,
          as: "category",
          attributes: ["id", "code", "name"],
          where: Object.keys(categoryWhere).length > 0 ? (categoryWhere as WhereOptions) : undefined,
        },
      ],
      order: [
        ["isPinned", "DESC"],
        ["created_at", "DESC"],
      ],
      limit,
      offset,
    });

    return {
      items: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public static async getGroupedNews(departmentId?: string, keyword?: string) {
    const where: Record<string | symbol, unknown> = { isActive: true };
    if(departmentId) where["departmentId"] = departmentId;
    if(keyword && keyword.trim().length > 0) {
      where["title"] = { [Op.like]: `%${keyword.trim()}%` };
    }

    const list = await NewsModel.findAll({
      where: where as WhereOptions,
      include: [
        { model: DepartmentModel, as: "department", attributes: ["id", "code", "name"] },
        { model: CategoryModel, as: "category", attributes: ["id", "code", "name"] },
      ],
      order: [
        ["isPinned", "DESC"],
        ["created_at", "DESC"],
      ],
      limit: 60,
    });

    const training: NewsModel[] = [];
    const university: NewsModel[] = [];
    const studentActivity: NewsModel[] = [];

    for(const item of list) {
      const code = item.category?.code;
      if (code === "training") {
        training.push(item);
      } else if(code === "student_activity") {
        studentActivity.push(item);
      } else {
        university.push(item);
      }
    }

    return { training, university, studentActivity };
  }

  public static async getNewsById(id: string) {
    const news = await NewsModel.findOne({
      where: { id, isActive: true },
      include: [
        { model: DepartmentModel, as: "department" },
        { model: CategoryModel, as: "category" },
        { model: AttachmentModel, as: "attachments" },
        {
          model: CommentModel,
          as: "comments",
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if(!news) {
      throw new ApiError("404", "Không tìm thấy bản tin yêu cầu");
    }

    await news.increment("views", { by: 1 });
    return news;
  }

  public static async addComment(
    newsId: string,
    payload: { content: string; userId?: string; authorName: string; avatar?: string }
  ) {
    const news = await NewsModel.findByPk(newsId);
    if(!news) {
      throw new ApiError("404", "Bản tin không tồn tại để thêm bình luận");
    }

    return await CommentModel.create({
      newsId,
      content: payload.content,
      userId: payload.userId,
      authorName: payload.authorName,
      avatar: payload.avatar,
    });
  }

  public static async getComments(newsId: string) {
    return await CommentModel.findAll({
      where: { newsId },
      order: [["created_at", "DESC"]],
    });
  }

  public static async addBookmark(newsId: string, userId: string) {
    const [record] = await BookMarkModel.findOrCreate({
      where: { newsId, userId },
      defaults: { newsId, userId },
    });
    return record;
  }

  public static async removeBookmark(newsId: string, userId: string) {
    return await BookMarkModel.destroy({
      where: { newsId, userId },
    });
  }

  public static async checkBookmark(newsId: string, userId: string) {
    const found = await BookMarkModel.findOne({
      where: { newsId, userId },
    });
    return found !== null;
  }

  public static async getBookmarks(userId: string) {
    return await BookMarkModel.findAll({
      where: { userId },
      include: [
        {
          model: NewsModel,
          as: "news",
          include: [
            { model: DepartmentModel, as: "department", attributes: ["name"] },
            { model: CategoryModel, as: "category", attributes: ["name"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  public static async seedInitialData() {
    const deptCount = await DepartmentModel.count();
    if(deptCount === 0) {
      const pdt = await DepartmentModel.create({
        code: "PDT",
        name: "Phòng đào tạo",
        order: 1,
        isActive: true,
      });
      const pdbcl = await DepartmentModel.create({
        code: "PDBCL",
        name: "Phòng Đảm bảo chất lượng và khảo thí",
        order: 2,
        isActive: true,
      });
      await DepartmentModel.create({
        code: "PKHCN",
        name: "Phòng Khoa học Công nghệ",
        order: 3,
        isActive: true,
      });
      await DepartmentModel.create({
        code: "PTCKT",
        name: "Phòng Tài chính kế toán",
        order: 4,
        isActive: true,
      });

      const cmDaoTao = await CategoryModel.create({
        code: "training",
        name: "Tin đào tạo",
        order: 1,
      });
      const cmNhaTruong = await CategoryModel.create({
        code: "university",
        name: "Tin nhà trường",
        order: 2,
      });
      await CategoryModel.create({
        code: "student_activity",
        name: "Hoạt động sinh viên",
        order: 3,
      });

      // Tạo 2 bản tin mẫu
      const tin1 = await NewsModel.create({
        title: "KH100_Xét tốt nghiệp tiến sĩ đợt 2 năm 2025",
        summary: "Kế hoạch xét tốt nghiệp tiến sĩ đợt 2 năm 2025",
        content: "<p>Kế hoạch xét tốt nghiệp tiến sĩ đợt 2 năm học 2024-2025 theo quyết định của Hội đồng Đào tạo.</p>",
        categoryId: cmDaoTao.id,
        departmentId: pdt.id,
        authorName: "Nguyễn Thái Vinh",
        startDate: "12/05/2025",
        isPinned: true,
        isActive: true,
        views: 0,
      });

      await AttachmentModel.create({
        newsId: tin1.id,
        fileName: "KH100_Xet_Tot_Nghiep.pdf",
        fileUrl: "https://qldtbeta.phenikaa-uni.edu.vn/files/KH100.pdf",
        fileSize: 1048576,
        fileType: "application/pdf",
      });

      await NewsModel.create({
        title: "Thông báo Kế hoạch Tổ chức thi Đánh giá CĐR năng lực ngoại ngữ",
        summary: "Kế hoạch thi chuẩn đầu ra",
        content: "<p>Thông báo kế hoạch tổ chức thi đánh giá chuẩn đầu ra ngoại ngữ nội bộ.</p>",
        categoryId: cmNhaTruong.id,
        departmentId: pdbcl.id,
        authorName: "Phòng ĐBCL&KT",
        startDate: "08/06/2026",
        isPinned: true,
        isActive: true,
        views: 0,
      });

      return { seeded: true, message: "Khởi tạo dữ liệu mẫu thành công" };
    }
    return { seeded: false, message: "Dữ liệu phòng ban và chuyên mục đã tồn tại từ trước" };
  }
}