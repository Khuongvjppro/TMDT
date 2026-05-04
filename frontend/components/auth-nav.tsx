"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "./auth-provider";
import { getRoleNavItems } from "./nav-config";

function roleClassName(role: string) {
  if (role === "ADMIN") return "bg-rose-100 text-rose-700";
  if (role === "EMPLOYER") return "bg-blue-100 text-blue-700";
  if (role === "CANDIDATE") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

function isActivePath(pathname: string, matchers?: string[]) {
  if (!matchers || matchers.length === 0) {
    return false;
  }

  if (matchers.includes("__EMPLOYER_MY_JOBS__")) {
    if (pathname === "/employer/jobs") {
      return true;
    }
    return /^\/employer\/jobs\/\d+\/(edit|applications)$/.test(pathname);
  }

  return matchers.some((matcher) => {
    if (matcher.startsWith("__")) {
      return false;
    }

    if (matcher === "/") {
      return pathname === "/";
    }
    return pathname === matcher || pathname.startsWith(`${matcher}/`);
  });
}

function navItemClass(isActive: boolean) {
  return isActive
    ? "flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-900"
    : "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
}

export default function AuthNav() {
  const { auth, isReady, clearAuthState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = getRoleNavItems(auth?.user.role);
  const userShortName = useMemo(() => {
    const source = auth?.user.fullName || auth?.user.email || "U";
    return source.charAt(0).toUpperCase();
  }, [auth?.user.fullName, auth?.user.email]);

  function onLogout() {
    setIsSidebarOpen(false);
    clearAuthState();
    router.push("/");
  }

  return (
    <nav className="flex items-center gap-3 text-sm font-medium">
      {!isReady ? (
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          Loading...
        </span>
      ) : null}

      {isReady && auth ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-700"
            aria-label="Open sidebar menu"
          >
            {userShortName}
          </button>
        </div>
      ) : null}

      {isReady && !auth ? (
        <Link
          className={
            pathname === "/login"
              ? "rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
              : "rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700"
          }
          href="/login"
        >
          Login
        </Link>
      ) : null}

      {isReady && auth ? (
        <>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className={`fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[1px] transition-opacity duration-300 ${
              isSidebarOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            aria-label="Close sidebar overlay"
          />

          <aside
            className={`fixed left-0 top-0 z-50 h-full w-[80vw] max-w-[320px] overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-300 ease-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-lg font-black text-white">
                  {userShortName}
                </div>
                <div>
                  <p className="text-base font-black text-slate-900">
                    {auth.user.fullName}
                  </p>
                  <p className="text-xs text-slate-500">{auth.user.email}</p>
                </div>
              </div>
              <p
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${roleClassName(auth.user.role)}`}
              >
                {auth.user.role}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Link
                href="/"
                onClick={() => setIsSidebarOpen(false)}
                className={navItemClass(pathname === "/")}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5 10.5V20h14v-9.5" />
                </svg>
                Home
              </Link>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={navItemClass(
                    isActivePath(pathname, item.matchers),
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
                </svg>
                Support
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path d="M9 6h6" />
                  <path d="M9 18h6" />
                  <path d="M12 6v12" />
                  <path d="M15.5 12H5" />
                  <path d="M18 9l3 3-3 3" />
                </svg>
                Logout
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </nav>
  );
}
