"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../lib/api";
import { mapZodErrors, resetPasswordSchema } from "../../lib/validation";

type ResetPasswordField = "password" | "confirmPassword";

function toVietnameseResetPasswordMessage(message: string) {
  if (message === "Password reset successful") {
    return "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.";
  }

  if (message === "Invalid or expired reset password token") {
    return "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
  }

  if (message === "Invalid reset password token") {
    return "Mã đặt lại mật khẩu không hợp lệ.";
  }

  if (message === "Password confirmation does not match") {
    return "Mật khẩu xác nhận không khớp.";
  }

  return message;
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ResetPasswordField, string>>
  >({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageType(null);
    setFieldErrors({});

    if (!token) {
      setMessage("Thiếu mã đặt lại mật khẩu. Vui lòng kiểm tra lại liên kết trong email.");
      setMessageType("error");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const parsed = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      setFieldErrors(mapZodErrors<ResetPasswordField>(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await resetPassword({
        token,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
      });

      setMessage(
        toVietnameseResetPasswordMessage(data.message) ||
          "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
      );
      setMessageType("success");
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại";
      setMessage(toVietnameseResetPasswordMessage(rawMessage));
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Đặt lại mật khẩu
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Tạo mật khẩu mới</h1>
        <p className="text-sm text-[#414752]">
          Nhập mật khẩu mới để hoàn tất quá trình khôi phục tài khoản.
        </p>
      </div>

      <form noValidate className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#191c21]" htmlFor="password">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              aria-label="Hiển thị mật khẩu mới"
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#191c21]"
            htmlFor="confirmPassword"
          >
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              aria-label="Hiển thị xác nhận mật khẩu mới"
              title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {fieldErrors.confirmPassword ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#004e99] to-[#0a66c2] py-3.5 text-sm font-bold text-white transition active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? "Đang cập nhật mật khẩu..." : "Xác nhận mật khẩu mới"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-4 text-sm font-medium ${
            messageType === "error" ? "text-red-600" : "text-slate-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-[#0a66c2] hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </section>
  );
}
