import z from "zod";
import { DOCUMENT_TYPES } from "../models/document/document.model";

export const getDocumentListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1, "Trang phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().int().min(1).max(100, "Mỗi trang tối đa 100 văn bản").default(10),
    keyword: z.string().trim().optional(),
    type: z.enum(DOCUMENT_TYPES, "Loại văn bản không hợp lệ").optional(),
    departmentId: z.string().optional()
  })
});