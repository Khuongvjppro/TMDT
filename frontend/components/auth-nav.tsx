"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "./auth-provider";
import { UserRole } from "../types";

function roleClassName(role: string) {
  if (role === "ADMIN") return "bg-rose-100 text-rose-700";
  if (role === "EMPLOYER") return "bg-blue-100 text-blue-700";
  if (role === "CANDIDATE") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

type NavItem = {
  href: string;
  label: string;
  matchers?: string[];
};

function getRoleNavItems(role?: UserRole): NavItem[] {
  if (!role) return [];

  if (role === "EMPLOYER") {
    return [
      {
        href: "/employer/jobs/new",
        label: "Post a Job",
        matchers: ["/employer/jobs/new", "/recruiter/jobs/new"],
      },
      {
        href: "/employer/jobs",
        label: "My Jobs",
        matchers: ["__EMPLOYER_MY_JOBS__"],
      },
      {
        href: "/employer/profile",
        label: "Company Profile",
        matchers: ["/employer/profile"],
      },
      {
        href: "/employer/candidates",
        label: "Candidates",
        matchers: ["/employer/candidates"],
      },
      {
        href: "/employer/billing",
        label: "Billing",
        matchers: ["/employer/billing"],
      },
      {
        href: "/employer/transactions",
        label: "Transactions",
        matchers: ["/employer/transactions"],
      },
    ];
  }

  if (role === "ADMIN") {
    return [
      {
        href: "/admin/users",
        label: "Admin Users",
        matchers: ["/admin/users"],
      },
    ];
  }

  return [];
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
            className={`fixed left-0 top-0 z-50 h-full w-[78vw] max-w-[300px] overflow-y-auto border-r border-slate-200 bg-white p-6 shadow-2xl transition-transform duration-300 ease-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div>
              <p className="mt-1 text-lg font-black text-slate-900">{auth.user.fullName}</p>
              <p className="mt-1 text-sm text-slate-600">{auth.user.email}</p>
              <p
                className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${roleClassName(auth.user.role)}`}
              >
                {auth.user.role}
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                href="/"
                onClick={() => setIsSidebarOpen(false)}
                className={
                  pathname === "/"
                    ? "block rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                    : "block rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                }
              >
                Home
              </Link>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={
                    isActivePath(pathname, item.matchers)
                      ? "block rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                      : "block rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700"
            >
              Logout
            </button>
          </aside>
        </>
      ) : null}
    </nav>
  );
}
