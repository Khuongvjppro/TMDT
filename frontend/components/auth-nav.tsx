"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

function roleClassName(role: string) {
  if (role === "ADMIN") return "bg-rose-100 text-rose-700";
  if (role === "EMPLOYER") return "bg-blue-100 text-blue-700";
  if (role === "CANDIDATE") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export default function AuthNav() {
  const { auth, isReady, clearAuthState } = useAuth();
  const router = useRouter();

  function onLogout() {
    clearAuthState();
    router.push("/");
  }

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium">
      <Link className="rounded-full bg-white/70 px-4 py-2 text-slate-700 hover:bg-white" href="/">
        Jobs
      </Link>
      <Link className="rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700" href="/employer/jobs/new">
        Post a Job
      </Link>
      <Link className="rounded-full bg-white/70 px-4 py-2 text-slate-700 hover:bg-white" href="/admin/users">
        Admin Users
      </Link>

      {!isReady ? (
        <span className="rounded-full bg-white/70 px-4 py-2 text-slate-600">Loading...</span>
      ) : null}

      {isReady && auth ? (
        <>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleClassName(auth.user.role)}`}>
            {auth.user.role}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-slate-700">{auth.user.email}</span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </>
      ) : null}

      {isReady && !auth ? (
        <Link className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700" href="/login">
          Login
        </Link>
      ) : null}
    </nav>
  );
}
