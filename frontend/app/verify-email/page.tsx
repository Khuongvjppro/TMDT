"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "../../lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying email...");

  useEffect(() => {
    async function runVerification() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token. Please check the email link.");
        return;
      }

      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message || "Email verified successfully. You can now sign in.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Email verification failed or the link has expired",
        );
      }
    }

    runVerification();
  }, [token]);

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Verify email
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Finish creating your account</h1>
        <p
          className={`text-sm font-medium ${
            status === "error" ? "text-red-600" : "text-slate-700"
          }`}
        >
          {message}
        </p>

        <div className="pt-2">
          {status === "success" ? (
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-gradient-to-r from-[#004e99] to-[#0a66c2] px-5 py-2.5 text-sm font-bold text-white"
            >
              Go to sign in
            </Link>
          ) : (
            <Link href="/register" className="text-sm font-semibold text-[#0a66c2] hover:underline">
              Back to sign up
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
