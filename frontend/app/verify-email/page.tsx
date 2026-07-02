"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { verifyEmail } from "../../lib/api";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực email...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    async function runVerification() {
      if (!token) {
        setStatus("error");
        setMessage("Thiếu mã xác thực. Vui lòng kiểm tra lại đường dẫn trong email.");
        return;
      }

      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message || "Xác thực email thành công. Bạn có thể đăng nhập.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Xác thực email thất bại hoặc liên kết đã hết hạn",
        );
      }
    }

    runVerification();
  }, []);

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-[#191c21] shadow-lg">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a66c2]">
          Xác thực email
        </p>
        <h1 className="text-2xl font-bold text-[#191c21]">Hoàn tất đăng ký tài khoản</h1>
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
              Đi đến đăng nhập
            </Link>
          ) : (
            <Link href="/register" className="text-sm font-semibold text-[#0a66c2] hover:underline">
              Quay lại đăng ký
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
