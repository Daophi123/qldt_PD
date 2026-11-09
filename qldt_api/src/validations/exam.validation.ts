import z from "zod";

export const getExamScheduleSchema = z.object({
  query: z.object({
    semesterCode: z.string().trim().min(1, "Mã học kỳ không được để trống").optional()
  })
});
