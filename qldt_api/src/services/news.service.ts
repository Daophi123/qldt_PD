import { Op, UniqueConstraintError, WhereOptions, literal, where as sqlWhere } from "sequelize";
import { CategoryModel, DepartmentModel, NewsModel, AttachmentModel, CommentModel, BookMarkModel, NewsViewModel } from "../models";
import { ApiError } from "../utils/apiError";
import { toISODate } from "../utils/date.util";
import { SEED_CATEGORIES, SEED_DEPARTMENTS, SEED_NEWS } from "../seeds/news.seed";

const START_DATE_ISO = literal(
  "substr(`NewsModel`.`start_date`, 7, 4) || '-' || substr(`NewsModel`.`start_date`, 4, 2) || '-' || substr(`NewsModel`.`start_date`, 1, 2)"
);

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

    return await this.findNewsDetail(news.id);
  }

  public static async updateNews(id: string, payload: Record<string, unknown>) {
    const news = await NewsModel.findByPk(id);
    if(!news) {
      throw new ApiError("404", "Không tìm thấy bản tin để cập nhật");
    }
    if(typeof payload.categoryId === "string" && !(await CategoryModel.findByPk(payload.categoryId))) {
      throw new ApiError("404", "Chuyên mục tin tức không tồn tại");
    }
    if(typeof payload.departmentId === "string" && !(await DepartmentModel.findByPk(payload.departmentId))) {
      throw new ApiError("404", "Phòng ban / đơn vị ban hành không tồn tại");
    }
    await news.update(payload);
    return await this.findNewsDetail(id);
  }

  public static async deleteNews(id: string) {
    const news = await NewsModel.findByPk(id);
    if(!news) {
      throw new ApiError("404", "Không tìm thấy bản tin để xóa");
    }
    await AttachmentModel.destroy({ where: { newsId: id } });
    await CommentModel.destroy({ where: { newsId: id } });
    await BookMarkModel.destroy({ where: { newsId: id } });
    await NewsViewModel.destroy({ where: { newsId: id } });
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
      where[Op.and] = [sqlWhere(START_DATE_ISO, { [Op.between]: [toISODate(query.startDate), toISODate(query.endDate)] })];
    } else if(query.startDate) {
      where[Op.and] = [sqlWhere(START_DATE_ISO, { [Op.gte]: toISODate(query.startDate) })];
    } else if(query.endDate) {
      where[Op.and] = [sqlWhere(START_DATE_ISO, { [Op.lte]: toISODate(query.endDate) })];
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

  private static async findNewsDetail(id: string, onlyActive = false) {
    const news = await NewsModel.findOne({
      where: onlyActive ? { id, isActive: true } : { id },
      include: [
        { model: DepartmentModel, as: "department" },
        { model: CategoryModel, as: "category" },
        { model: AttachmentModel, as: "attachments" },
        { model: CommentModel, as: "comments" },
      ],
      order: [[{ model: CommentModel, as: "comments" }, "created_at", "DESC"]],
    });

    if(!news) {
      throw new ApiError("404", "Không tìm thấy bản tin yêu cầu");
    }

    return news;
  }

  private static async recordView(newsId: string, userId: string) {
    try {
      await NewsViewModel.create({ newsId, userId });
      return true;
    } catch(e) {
      if(e instanceof UniqueConstraintError) {
        return false;
      }
      throw e;
    }
  }

  public static async getNewsById(id: string, userId: string) {
    const news = await this.findNewsDetail(id, true);
    const isFirstView = await this.recordView(id, userId);
    if(isFirstView) {
      await news.increment("views", { by: 1 });
      news.setDataValue("views", news.views + 1);
    }
    return news;
  }

  public static async addComment(newsId: string, payload: { content: string; userId?: string; authorName: string; avatar?: string }) {
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
    const departmentIds = new Map<string, string>();
    for(const item of SEED_DEPARTMENTS) {
      const [department] = await DepartmentModel.findOrCreate({
        where: { code: item.code },
        defaults: { ...item, isActive: true },
      });
      departmentIds.set(item.code, department.id);
    }

    const categoryIds = new Map<string, string>();
    for(const item of SEED_CATEGORIES) {
      const [category] = await CategoryModel.findOrCreate({
        where: { code: item.code },
        defaults: item,
      });
      categoryIds.set(item.code, category.id);
    }

    let createdCount = 0;
    for(const item of SEED_NEWS) {
      const existed = await NewsModel.count({ where: { title: item.title } });
      if(existed > 0) {
        continue;
      }

      const { categoryCode, departmentCode, attachments, ...fields } = item;
      const news = await NewsModel.create({
        ...fields,
        categoryId: categoryIds.get(categoryCode),
        departmentId: departmentIds.get(departmentCode),
        isPinned: fields.isPinned ?? false,
        isActive: true,
        views: fields.views ?? 0,
      });

      for(const file of attachments ?? []) {
        await AttachmentModel.create({ ...file, newsId: news.id });
      }
      createdCount++;
    }

    if(createdCount === 0) {
      return { seeded: false, createdCount, message: "Dữ liệu tin tức mẫu đã đủ, không thêm bản tin nào" };
    }
    return { seeded: true, createdCount, message: `Đã thêm ${createdCount} bản tin mẫu` };
  }
}