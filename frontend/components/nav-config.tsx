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
        href: "/employer/chat",
        label: "Candidate Chat",
        matchers: ["/employer/chat"],
        icon: <span aria-hidden="true">💬</span>,
      },
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
        href: "/employer/stats",
        label: "Statistics",
        matchers: ["/employer/stats"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M4 4v16h16" />
            <path d="M7 14l3-3 3 3 4-5" />
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
        href: "/admin",
        label: "Dashboard",
        matchers: ["/admin"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ),
      },
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
      {
        href: "/admin/stats",
        label: "Statistics",
        matchers: ["/admin/stats"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M4 4v16h16" />
            <path d="M7 14l3-3 3 3 4-5" />
          </svg>
        ),
      },
      {
        href: "/admin/moderation",
        label: "Moderation",
        matchers: ["/admin/moderation"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            <path d="M9 12h6M9 16h6" />
          </svg>
        ),
      },
      {
        href: "/admin/categories",
        label: "Categories",
        matchers: ["/admin/categories"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M4 7h16M4 12h10M4 17h16" />
          </svg>
        ),
      },
      {
        href: "/admin/reviews",
        label: "Reviews",
        matchers: ["/admin/reviews"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M7 8h10M7 12h6M7 16h8" />
            <path d="M5 4h14v16H5z" />
          </svg>
        ),
      },
    ];
  }

  if (role === "CANDIDATE") {
    return [
      {
        href: "/candidate/profile",
        label: "Profile & CVs",
        matchers: ["/candidate/profile"],
        icon: <span aria-hidden="true">👤</span>,
      },
      {
        href: "/candidate/jobs",
        label: "Advanced Job Search",
        matchers: ["/candidate/jobs"],
        icon: <span aria-hidden="true">🔎</span>,
      },
      {
        href: "/candidate/saved-jobs",
        label: "Saved Jobs",
        matchers: ["/candidate/saved-jobs"],
        icon: <span aria-hidden="true">💙</span>,
      },
      {
        href: "/candidate/applications",
        label: "Application History",
        matchers: ["/candidate/applications"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        href: "/candidate/alerts",
        label: "Job Alert",
        matchers: ["/candidate/alerts"],
        icon: <span aria-hidden="true">🔔</span>,
      },
      {
        href: "/candidate/reviews",
        label: "Company Reviews",
        matchers: ["/candidate/reviews"],
        icon: <span aria-hidden="true">⭐</span>,
      },
      {
        href: "/candidate/chat",
        label: "Employer Chat",
        matchers: ["/candidate/chat"],
        icon: <span aria-hidden="true">💬</span>,
      },
    ];
  }

  return [];
}
