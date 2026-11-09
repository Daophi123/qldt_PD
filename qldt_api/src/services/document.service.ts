import { Op, WhereOptions, literal } from "sequelize";
import { DepartmentModel, DocumentFileModel, DocumentModel } from "../models";
import { DocumentType } from "../models/document/document.model";
import { ApiError } from "../utils/apiError";
import { environment } from "../config/environment";
import { SEED_DOCUMENTS } from "../seeds/document.seed";

const ISSUED_DATE_SORT = literal("substr(issued_date, 7, 4) || substr(issued_date, 4, 2) || substr(issued_date, 1, 2)");

interface DocumentListQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  type?: DocumentType;
  departmentId?: string;
}

export class DocumentService {
  public static async getDocuments(query: DocumentListQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Record<string | symbol, unknown> = { isActive: true };

    if(query.type) where["type"] = query.type;
    if(query.departmentId) where["departmentId"] = query.departmentId;
    if(query.keyword) {
      const kw = `%${query.keyword}%`;
      where[Op.or] = [
        { code: { [Op.like]: kw } },
        { title: { [Op.like]: kw } }
      ];
    }

    const { count, rows } = await DocumentModel.findAndCountAll({
      where: where as WhereOptions,
      include: [
        { model: DepartmentModel, as: "department", attributes: ["id", "code", "name"] },
        { model: DocumentFileModel, as: "files", attributes: ["id", "fileName", "fileUrl", "fileSize", "fileType"], separate: true }
      ],
      order: [[ISSUED_DATE_SORT, "DESC"], ["code", "ASC"]],
      limit,
      offset: (page - 1) * limit
    });

    return {
      items: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  public static async seedInitialData() {
    if(environment.NODE_ENV !== "development") {
      throw new ApiError("403", "Chỉ được khởi tạo dữ liệu mẫu ở môi trường development");
    }

    let createdCount = 0;
    for(const item of SEED_DOCUMENTS) {
      const department = await DepartmentModel.findOne({ where: { code: item.departmentCode } });
      if(!department) {
        throw new ApiError("400", `Chưa có đơn vị ${item.departmentCode}. Hãy chạy seed tin tức (POST /api/v1/news/seed) trước`);
      }

      const { departmentCode, file, ...fields } = item;
      const [document, created] = await DocumentModel.findOrCreate({
        where: { code: item.code },
        defaults: { ...fields, departmentId: department.id }
      });
      if(created) {
        await DocumentFileModel.create({ ...file, documentId: document.id });
        createdCount++;
      }
    }

    if(createdCount === 0) {
      return { seeded: false, createdCount, message: "Dữ liệu văn bản mẫu đã đủ, không thêm gì" };
    }
    return { seeded: true, createdCount, message: `Đã thêm ${createdCount} văn bản mẫu` };
  }
}