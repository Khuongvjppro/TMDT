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
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
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
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        href: "/candidate/jobs",
        label: "Advanced Job Search",
        matchers: ["/candidate/jobs"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ),
      },
      {
        href: "/candidate/saved-jobs",
        label: "Saved Jobs",
        matchers: ["/candidate/saved-jobs"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ),
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
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      },
      {
        href: "/candidate/reviews",
        label: "Company Reviews",
        matchers: ["/candidate/reviews"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
      {
        href: "/candidate/chat",
        label: "Employer Chat",
        matchers: ["/candidate/chat"],
        icon: (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
    ];
  }

  return [];
}
