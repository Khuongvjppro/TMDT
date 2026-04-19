import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu cần ít nhất 6 ký tự"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ và tên")
      .min(2, "Họ và tên cần ít nhất 2 ký tự"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Email không đúng định dạng"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu cần ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type LoginFormInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;

export function mapZodErrors<T extends string>(issues: z.ZodIssue[]) {
  const errors: Partial<Record<T, string>> = {};

  for (const issue of issues) {
    const field = issue.path[0] as T | undefined;
    if (!field || errors[field]) continue;
    errors[field] = issue.message;
  }

  return errors;
}
