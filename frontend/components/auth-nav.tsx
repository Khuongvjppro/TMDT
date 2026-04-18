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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navItems = getRoleNavItems(auth?.user.role);
  const userShortName = useMemo(() => {
    const source = auth?.user.fullName || auth?.user.email || "U";
    return source.charAt(0).toUpperCase();
  }, [auth?.user.fullName, auth?.user.email]);

  function onLogout() {
    setIsUserMenuOpen(false);
    clearAuthState();
    router.push("/");
  }

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          className={
            isActivePath(pathname, item.matchers)
              ? "rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
              : "rounded-full bg-white/70 px-4 py-2 text-slate-700 hover:bg-white"
          }
          href={item.href}
        >
          {item.label}
        </Link>
      ))}

      {!isReady ? (
        <span className="rounded-full bg-white/70 px-4 py-2 text-slate-600">
          Loading...
        </span>
      ) : null}

      {isReady && auth ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white hover:bg-slate-700"
            aria-label="User menu"
          >
            {userShortName}
          </button>

          {isUserMenuOpen ? (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <p className="text-xs font-semibold text-slate-500">Signed in as</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{auth.user.fullName}</p>
              <p className="mt-1 text-xs text-slate-600">{auth.user.email}</p>
              <p className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-bold ${roleClassName(auth.user.role)}`}>
                {auth.user.role}
              </p>

              <button
                type="button"
                onClick={onLogout}
                className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {isReady && !auth ? (
        <Link
          className={
            pathname === "/login"
              ? "rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
              : "rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          }
          href="/login"
        >
          Login
        </Link>
      ) : null}
    </nav>
  );
}
