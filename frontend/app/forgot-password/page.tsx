"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPassword } from "../../lib/api";
import { forgotPasswordSchema, mapZodErrors } from "../../lib/validation";

type ForgotPasswordField = "email";

function toVietnameseForgotPasswordMessage(message: string) {
  if (message === "If this email exists, a reset link has been sent") {
    return "Chúng tôi đã gửi liên kết đặt lại mật khẩu.";
  }

  if (message === "Failed to send reset password email") {
    return "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.";
  }

  return message;
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devResetPasswordLink, setDevResetPasswordLink] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ForgotPasswordField, string>>
  >({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageType(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(mapZodErrors<ForgotPasswordField>(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await forgotPassword(parsed.data.email);
      setDevResetPasswordLink(data.devResetPasswordLink || "");
      setMessage(
        toVietnameseForgotPasswordMessage(data.message) ||
          "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.",
      );
      setMessageType("success");
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Không thể xử lý yêu cầu";
      setMessage(toVietnameseForgotPasswordMessage(rawMessage));
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Quên mật khẩu
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Khôi phục mật khẩu</h1>
        <p className="text-sm text-[#414752]">
          Nhập email tài khoản. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu.
        </p>
      </div>

      <form noValidate className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#191c21]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Nhập email của bạn"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
            required
            disabled={isSubmitting}
          />
          {fieldErrors.email ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.email}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#004e99] to-[#0a66c2] py-3.5 text-sm font-bold text-white transition active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? "Đang gửi liên kết..." : "Gửi liên kết đặt lại mật khẩu"}
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

      {devResetPasswordLink ? (
        <p className="mt-2 text-xs text-slate-500">
          Dev link: <a className="text-[#0a66c2] underline" href={devResetPasswordLink}>Mở trang đặt lại mật khẩu</a>
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-600">
        Đã nhớ mật khẩu?{" "}
        <Link href="/login" className="font-semibold text-[#0a66c2] hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </section>
  );
}
