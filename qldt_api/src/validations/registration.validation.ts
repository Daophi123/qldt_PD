import z from "zod";

export const getRegistrationSchema = z.object({
  query: z.object({
    semesterCode: z.string().trim().min(1, "Mã học kỳ không được để trống").optional()
  })
});

export const registerSchema = z.object({
  body: z.object({
    classSectionId: z.string("Chưa chọn lớp học phần").trim().min(1, "Chưa chọn lớp học phần")
  })
});

export const cancelRegistrationSchema = z.object({
  params: z.object({
    enrollmentId: z.string().trim().min(1, "Mã lượt đăng ký không được để trống")
  })
});
