"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../../lib/api";
import { mapZodErrors, resetPasswordSchema } from "../../lib/validation";

type ResetPasswordField = "password" | "confirmPassword";

function toEnglishResetPasswordMessage(message: string) {
  if (message === "Password reset successful") {
    return "Password reset successful. You can now sign in with your new password.";
  }

  if (message === "Invalid or expired reset password token") {
    return "The reset password link is invalid or has expired.";
  }

  if (message === "Invalid reset password token") {
    return "Invalid reset password token.";
  }

  if (message === "Password confirmation does not match") {
    return "Password confirmation does not match.";
  }

  return message;
}

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

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
      setMessage("Missing reset token. Please check the link in your email.");
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
        toEnglishResetPasswordMessage(data.message) ||
          "Password reset successful. You can now sign in with your new password.",
      );
      setMessageType("success");
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Password reset failed";
      setMessage(toEnglishResetPasswordMessage(rawMessage));
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form noValidate className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#191c21]" htmlFor="password">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a new password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              aria-label="Show new password"
              title={showPassword ? "Hide password" : "Show password"}
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
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-[#191c21] outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
              aria-label="Show confirmation password"
              title={showConfirmPassword ? "Hide password" : "Show password"}
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
          {isSubmitting ? "Updating password..." : "Confirm new password"}
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
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Reset password
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Create a new password</h1>
        <p className="text-sm text-[#414752]">
          Enter a new password to finish restoring your account.
        </p>
      </div>

      <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading form...</p>}>
        <ResetPasswordFormContent />
      </Suspense>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-[#0a66c2] hover:underline">
          Back to sign in
        </Link>
      </p>
    </section>
  );
}
