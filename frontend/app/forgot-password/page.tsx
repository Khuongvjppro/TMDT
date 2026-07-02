"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPassword } from "../../lib/api";
import { forgotPasswordSchema, mapZodErrors } from "../../lib/validation";

type ForgotPasswordField = "email";

function toEnglishForgotPasswordMessage(message: string) {
  if (message === "If this email exists, a reset link has been sent") {
    return "If this email exists, a reset link has been sent.";
  }

  if (message === "Failed to send reset password email") {
    return "Failed to send reset password email. Please try again later.";
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
        toEnglishForgotPasswordMessage(data.message) ||
          "If this email exists, a reset link has been sent.",
      );
      setMessageType("success");
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Unable to process request";
      setMessage(toEnglishForgotPasswordMessage(rawMessage));
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Forgot password
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Reset your password</h1>
        <p className="text-sm text-[#414752]">
          Enter your account email. We will send a link to reset your password.
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
            placeholder="Enter your email"
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
          {isSubmitting ? "Sending link..." : "Send reset link"}
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
          Dev link: <a className="text-[#0a66c2] underline" href={devResetPasswordLink}>Open reset password page</a>
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-[#0a66c2] hover:underline">
          Back to sign in
        </Link>
      </p>
    </section>
  );
}
