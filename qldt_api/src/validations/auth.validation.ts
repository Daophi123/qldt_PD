import z from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1, "Tài khoản không được để trống"),
    password: z.string().min(1, "Mật khẩu không được để trống")
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Mật khẩu cũ không được để trống"),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
  })
  .refine((body) => body.oldPassword !== body.newPassword, "Mật khẩu mới phải khác mật khẩu cũ")
});