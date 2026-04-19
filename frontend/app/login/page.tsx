"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../../lib/api";
import { useAuth } from "../../components/auth-provider";
import { loginSchema, mapZodErrors } from "../../lib/validation";

type LoginField = "email" | "password";

export default function LoginPage() {
  const router = useRouter();
  const { setAuthState } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<LoginField, string>>
  >({});

  async function submitCredentials(email: string, password: string) {
    setIsSubmitting(true);
    setMessage("");
    try {
      const data = await login(email, password);
      setAuthState({ token: data.token, user: data.user });
      setMessage(`Đăng nhập thành công với vai trò ${data.user.role}`);
      router.push("/");
      router.refresh();
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(mapZodErrors<LoginField>(parsed.error.issues));
      return;
    }

    await submitCredentials(parsed.data.email, parsed.data.password);
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Đăng nhập tài khoản
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Chào mừng trở lại</h1>
        <p className="text-sm text-[#414752]">
          Vui lòng nhập thông tin đăng nhập để truy cập tài khoản của bạn.
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
            placeholder="Email"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
            required
            disabled={isSubmitting}
          />
          {fieldErrors.email ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[#191c21]" htmlFor="password">
              Mật khẩu
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-[#0a66c2] hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              aria-label="Hiển thị mật khẩu"
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.password}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#004e99] to-[#0a66c2] py-3.5 text-sm font-bold text-white transition active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-white px-3 font-semibold tracking-widest text-slate-500">
            hoặc tiếp tục với
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.4 14.7 2.5 12 2.5a9.5 9.5 0 1 0 0 19c5.5 0 9.1-3.9 9.1-9.4 0-.6 0-1.1-.1-1.9H12Z"
            />
            <path
              fill="#34A853"
              d="M3.6 7.3l3.2 2.3A6 6 0 0 1 12 6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.4 14.7 2.5 12 2.5 8.3 2.5 5 4.6 3.6 7.3Z"
            />
            <path
              fill="#4A90E2"
              d="M12 21.5c2.6 0 4.8-.9 6.4-2.5l-3-2.5c-.8.6-2 1.1-3.4 1.1-4 0-5.3-2.6-5.5-3.9l-3.2 2.5A9.5 9.5 0 0 0 12 21.5Z"
            />
            <path
              fill="#FBBC05"
              d="M3.6 16.7a9.5 9.5 0 0 1 0-9.4l3.2 2.3A6 6 0 0 0 6 12c0 .8.2 1.7.8 2.7l-3.2 2Z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-[#0A66C2]">
            <path d="M19 0H5C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5Zm-11 19H5V8h3v11ZM6.5 6.7A1.8 1.8 0 1 1 6.5 3a1.8 1.8 0 0 1 0 3.7ZM20 19h-3v-5.3c0-3.2-4-3-4 0V19h-3V8h3v1.7c1.4-2.4 7-2.6 7 2.4V19Z" />
          </svg>
          LinkedIn
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-[#0a66c2] hover:underline">
          Tạo tài khoản
        </Link>
      </p>

      {message ? (
        <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
