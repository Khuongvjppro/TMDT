"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Briefcase,
  ChartBar,
  ClipboardList,
  ListChecks,
  ShieldCheck,
  ShieldAlert,
  Users,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "../../components/auth-provider";
import { adminApi } from "../../lib/admin-api";
import { fetchJobs } from "../../lib/api";

const TASKS = [
  {
    title: "Admin dashboard + user management",
    description:
      "Quick overview of user metrics, open user management and handle system requests.",
  },
  {
    title: "Moderation queue for job postings",
    description:
      "Review new job postings to prevent inappropriate content or spam.",
  },
  {
    title: "Category management",
    description: "Manage job categories before they are shown to users.",
  },
  {
    title: "Basic reports",
    description:
      "Track new users, jobs, and applications over time.",
  },
  {
    title: "Audit log",
    description:
      "Record important admin actions for traceability and security.",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Lock account",
    href: "/admin/users",
  },
  {
    label: "Unlock account",
    href: "/admin/users",
  },
  {
    label: "Handle violation",
    href: "/admin/users",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { auth, isReady } = useAuth();
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    if (!auth || auth.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [auth, isReady, router]);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function loadDashboard() {
      if (!auth || auth.user.role !== "ADMIN") return;
      try {
        const usersResponse = await adminApi.listUsers({ page: 1, pageSize: 1 });
        const jobsResponse = await fetchJobs({});
        const auditResponse = await adminApi.getAuditLogs({ limit: 5, offset: 0 });

        if (!mounted) return;
        setUsersCount(usersResponse.pagination.total);
        setJobsCount(jobsResponse.pagination.total);
        setAuditLogs(auditResponse.items ?? []);

        // Try fetching aggregated stats (includes applications) from backend admin/stats
        try {
          let token: string | null = null;
          if (typeof window !== "undefined") {
            token = localStorage.getItem("accessToken") || localStorage.getItem("token");
            if (!token) {
              const raw = localStorage.getItem("jobfinder_auth");
              if (raw) {
                try {
                  token = JSON.parse(raw)?.token ?? null;
                } catch {
                  token = null;
                }
              }
            }
          }

          if (token) {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const res = await fetch(`${base}/admin/stats`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            if (res.ok) {
              const data = await res.json();
              if (!mounted) return;
              if (typeof data.users === "number") setUsersCount(data.users);
              if (typeof data.jobs === "number") setJobsCount(data.jobs);
              if (typeof data.applications === "number") setApplicationsCount(data.applications);
            }
          }
        } catch (err) {
          console.warn("Failed to fetch admin/stats", err);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    timer = setInterval(loadDashboard, 20000);
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [auth]);

  return (
    <section className="grid gap-8 py-8 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          {/* <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Navigation
          </p> */}
          {/* <h1 className="mt-3 text-3xl font-bold text-slate-900">Admin Navigation</h1> */}
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Dashboard</h1>
          {/* <p className="mt-3 text-sm text-slate-600">Quick access to core admin features.</p> */}
        </div>

        <nav className="space-y-3 mt-4">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <Users className="h-5 w-5 text-slate-500" />
            User Management
          </Link>

          <Link
            href="/admin/moderation"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ClipboardList className="h-5 w-5 text-slate-500" />
            Moderation Queue
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ListChecks className="h-5 w-5 text-slate-500" />
            System Categories
          </Link>

          <Link
            href="/admin/packages"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ShieldAlert className="h-5 w-5 text-slate-500" />
            Service Packages
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ShieldCheck className="h-5 w-5 text-slate-500" />
            Review Management
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ChartBar className="h-5 w-5 text-slate-500" />
            Reports
          </Link>
        </nav>
      </aside>

      <div className="space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                System Overview
              </p>
              <h2 className="mt-3 text-4xl font-bold text-slate-900">
                Welcome, {auth?.user.fullName ?? "Admin User"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                View user management, moderation queue, categories, and audit log at a glance.
              </p>
            </div>
            {/* <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <ShieldCheck className="h-4 w-4" />
                User Management
              </Link>
            </div> */}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between text-slate-500">
                <p className="text-sm font-semibold">New Users</p>
                <User className="h-5 w-5" />
              </div>
              <p className="mt-6 text-4xl font-semibold text-slate-900">
                {loading ? "..." : usersCount ?? "-"}
              </p>
              <p className="mt-2 text-sm text-slate-600">Total registered users</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between text-slate-500">
                <p className="text-sm font-semibold">Active Jobs</p>
                <Briefcase className="h-5 w-5" />
              </div>
              <p className="mt-6 text-4xl font-semibold text-slate-900">
                {loading ? "..." : jobsCount ?? "-"}
              </p>
              <p className="mt-2 text-sm text-slate-600">Active job postings</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between text-slate-500">
                <p className="text-sm font-semibold">Applications</p>
                <ChartBar className="h-5 w-5" />
              </div>
              <p className="mt-6 text-4xl font-semibold text-slate-900">{loading ? "..." : applicationsCount ?? "-"}</p>
              <p className="mt-2 text-sm text-slate-600">Applications in the system</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between text-slate-500">
                <p className="text-sm font-semibold">Pending Approval</p>
                <ClipboardList className="h-5 w-5" />
              </div>
              <p className="mt-6 text-4xl font-semibold text-slate-900">2</p>
              <p className="mt-2 text-sm text-slate-600">Job postings awaiting review</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Task Overview
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">User Management + Moderation</h3>
              </div>
              <Zap className="h-6 w-6 text-blue-600" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">User management</p>
                <p className="mt-3 text-sm text-slate-600">
                  View, lock/unlock accounts, update roles, and access the audit log from the management page.
                </p>
                <Link
                  href="/admin/users"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
                >
                  Go to user management
                </Link>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Moderation queue</p>
                <p className="mt-3 text-sm text-slate-600">
                  Monitor new job postings and ensure only appropriate content is displayed.
                </p>
                <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                  2 postings pending review
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Category Management</p>
                <p className="mt-3 text-sm text-slate-600">
                  Manage job categories and update the category structure before users search.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Basic reports</p>
                <p className="mt-3 text-sm text-slate-600">
                  Track new users, job postings, and application counts over time.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Audit log</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">Recent actions</h3>
              </div>
              <ListChecks className="h-6 w-6 text-slate-500" />
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Loading data...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-sm text-slate-600">No recent admin actions.</p>
            ) : (
              <ul className="space-y-3">
                {auditLogs.map((log) => (
                  <li key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{log.action.replaceAll("_", " ")}</p>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        {new Date(log.createdAt).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Performed by: {log.user.fullName}</p>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/admin/users"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View full audit log
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-3xl border border-slate-200 bg-white px-5 py-6 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
