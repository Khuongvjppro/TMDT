"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";
import { useAuth } from "../../components/auth-provider";

const QUICK_USERS = [
  { label: "Candidate", email: "candidate@demo.com", password: "123456" },
  { label: "Employer", email: "employer@demo.com", password: "123456" },
  { label: "Admin", email: "admin@demo.com", password: "123456" },
  { label: "Guest", email: "guest@demo.com", password: "123456" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuthState } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitCredentials(email: string, password: string) {
    setIsSubmitting(true);
    setMessage("");
    try {
      const data = await login(email, password);
      setAuthState({ token: data.token, user: data.user });
      setMessage(`Login success as ${data.user.role}`);
      router.push("/");
      router.refresh();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Login failed";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    await submitCredentials(email, password);
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in on web, then test role-based screens directly.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {QUICK_USERS.map((item) => (
          <button
            key={item.email}
            type="button"
            disabled={isSubmitting}
            onClick={() => submitCredentials(item.email, item.password)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <p className="font-semibold text-slate-900">Quick Login: {item.label}</p>
            <p className="text-xs text-slate-600">{item.email}</p>
          </button>
        ))}
      </div>

      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          required
          disabled={isSubmitting}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
