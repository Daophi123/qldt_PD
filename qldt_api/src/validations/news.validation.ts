import z from "zod";

export const getNewsListSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Trang phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    keyword: z.string().optional(),
    departmentId: z.string().optional(),
    categoryCode: z.string().optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isPinned: z.coerce.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Mã ID không được để trống"),
  }),
});

export const createNewsSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Tiêu đề bản tin không được để trống"),
    summary: z.string().optional(),
    content: z.string().trim().min(1, "Nội dung bản tin không được để trống"),
    categoryId: z.string().min(1, "Mã chuyên mục không được để trống"),
    departmentId: z.string().min(1, "Mã phòng ban/đơn vị không được để trống"),
    startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
    endDate: z.string().optional(),
    authorId: z.string().optional(),
    authorName: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    isPinned: z.boolean().optional().default(false),
    attachments: z
      .array(
        z.object({
          fileName: z.string().min(1, "Tên tệp không được để trống"),
          fileUrl: z.string().min(1, "Đường dẫn tệp không được để trống"),
          fileSize: z.number().optional(),
          fileType: z.string().optional(),
        })
      )
      .optional(),
  }),
});

export const updateNewsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Mã ID không được để trống"),
  }),
  body: z.object({
    title: z.string().trim().min(1, "Tiêu đề không được để trống").optional(),
    summary: z.string().optional(),
    content: z.string().trim().min(1, "Nội dung không được để trống").optional(),
    categoryId: z.string().optional(),
    departmentId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    authorId: z.string().optional(),
    authorName: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    isPinned: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Mã bản tin không được để trống"),
  }),
  body: z.object({
    content: z.string().min(1, "Nội dung bình luận không được để trống"),
    userId: z.string().optional(),
    authorName: z.string().min(1, "Tên người bình luận không hợp lệ").default("Sinh viên"),
    avatar: z.string().optional(),
  }),
});

export const bookmarkBodySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Mã bản tin không được để trống"),
  }),
  body: z.object({
    userId: z.string().min(1, "Mã người dùng không được để trống"),
  }),
});

export const userIdQuerySchema = z.object({
  query: z.object({
    userId: z.string().min(1, "Mã người dùng không được để trống"),
  }),
});