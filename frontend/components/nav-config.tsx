import type { ReactNode } from "react";
import { UserRole } from "../types";

type NavItem = {
  href: string;
  label: string;
  matchers?: string[];
  icon: ReactNode;
};

export function getRoleNavItems(role?: UserRole): NavItem[] {
  if (!role) return [];

  if (role === "EMPLOYER") {
    return [
      {
        href: "/employer/jobs/new",
        label: "Post a Job",
        matchers: ["/employer/jobs/new", "/recruiter/jobs/new"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        ),
      },
      {
        href: "/employer/jobs",
        label: "My Jobs",
        matchers: ["__EMPLOYER_MY_JOBS__"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M6 7h12v12H6z" />
            <path d="M9 7V5h6v2" />
          </svg>
        ),
      },
      {
        href: "/employer/profile",
        label: "Company Profile",
        matchers: ["/employer/profile"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M4 20V6a2 2 0 0 1 2-2h8l6 6v10" />
            <path d="M9 20v-6h6v6" />
          </svg>
        ),
      },
      {
        href: "/employer/candidates",
        label: "Candidates",
        matchers: ["/employer/candidates"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M2 20a7 7 0 0 1 14 0" />
            <path d="M17 12h5" />
          </svg>
        ),
      },
      {
        href: "/employer/billing",
        label: "Billing",
        matchers: ["/employer/billing"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 9h18" />
          </svg>
        ),
      },
      {
        href: "/employer/transactions",
        label: "Transactions",
        matchers: ["/employer/transactions"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M6 4h12v16H6z" />
            <path d="M9 9h6M9 13h6" />
          </svg>
        ),
      },
    ];
  }

  if (role === "ADMIN") {
    return [
      {
        href: "/admin/users",
        label: "Admin Users",
        matchers: ["/admin/users"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M7 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M2 20a7 7 0 0 1 10 0" />
            <path d="M16 7h6M16 11h6" />
          </svg>
        ),
      },
    ];
  }

  return [];
}
