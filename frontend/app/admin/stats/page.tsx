"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth-provider";
import { adminApi } from "../../../lib/admin-api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Color palettes ──────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#ef4444",
  EMPLOYER: "#6366f1",
  CANDIDATE: "#10b981",
  GUEST: "#f59e0b",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10b981",
  LOCKED: "#ef4444",
  DELETED: "#94a3b8",
};

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "#6366f1",
  PART_TIME: "#f59e0b",
  INTERN: "#10b981",
  FREELANCE: "#ec4899",
  REMOTE: "#06b6d4",
};

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  REVIEWING: "#3b82f6",
  ACCEPTED: "#10b981",
  REJECTED: "#ef4444",
};

const FALLBACK_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
];

// ── Labels ──────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "Employer",
  CANDIDATE: "Candidate",
  GUEST: "Guest",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  LOCKED: "Locked",
  DELETED: "Deleted",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  INTERN: "Intern",
  FREELANCE: "Freelance",
  REMOTE: "Remote",
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

// ── Helpers ─────────────────────────────────────────────────────────

function getColor(
  map: Record<string, string>,
  key: string,
  index: number,
): string {
  return map[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function toChartData(
  items: Record<string, string | number>[],
  key: string,
  labelMap: Record<string, string>,
): { name: string; value: number }[] {
  return items.map((item) => ({
    name: labelMap[item[key] as string] || (item[key] as string),
    value: Number(item.count),
  }));
}

// ── Shared Tooltip ──────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">{entry.name}</p>
      <p className="text-lg font-black text-slate-900">{entry.value}</p>
    </div>
  );
}

// ── Pie Chart Card ──────────────────────────────────────────────────

function PieCard({
  title,
  subtitle,
  data,
  colors,
}: {
  title: string;
  subtitle: string;
  data: { name: string; value: number }[];
  colors: Record<string, string>;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {subtitle}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
        </header>
        <div className="flex h-[260px] items-center justify-center">
          <p className="rounded-2xl bg-slate-50 px-5 py-3 text-sm text-slate-500">
            No data available yet
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {subtitle}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {total} total
        </span>
      </header>

      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={getColor(colors, entry.name, index)}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs font-medium text-slate-700">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs text-slate-500">
        {data.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div
              key={entry.name}
              className="rounded-xl bg-slate-50 px-2 py-1.5"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: getColor(colors, entry.name, 0),
                }}
              />
              <span className="ml-1 font-medium text-slate-700">
                {entry.name}
              </span>
              <span className="ml-1 text-slate-400">{pct}%</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function AdminStatsPage() {
  const { auth, isReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [userRoleData, setUserRoleData] = useState<
    { name: string; value: number }[]
  >([]);
  const [userStatusData, setUserStatusData] = useState<
    { name: string; value: number }[]
  >([]);
  const [jobTypeData, setJobTypeData] = useState<
    { name: string; value: number }[]
  >([]);
  const [applicationStatusData, setApplicationStatusData] = useState<
    { name: string; value: number }[]
  >([]);

  const canAccess = auth?.user.role === "ADMIN";

  async function loadData() {
    if (!auth?.token || !canAccess) return;
    setIsLoading(true);
    setMessage("");
    try {
      const [userRoles, userStatuses, jobTypes, appStatuses] =
        await Promise.all([
          adminApi.getUserRoleStats(),
          adminApi.getUserStatusStats(),
          adminApi.getJobTypeStats(),
          adminApi.getApplicationStatusStats(),
        ]);

      setUserRoleData(toChartData(userRoles.items, "role", ROLE_LABELS));
      setUserStatusData(
        toChartData(userStatuses.items, "status", STATUS_LABELS),
      );
      setJobTypeData(toChartData(jobTypes.items, "type", JOB_TYPE_LABELS));
      setApplicationStatusData(
        toChartData(appStatuses.items, "status", APPLICATION_STATUS_LABELS),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Cannot load stats",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [auth?.token, canAccess]);

  // ── Guard renders ─────────────────────────────────────────────────

  if (!isReady) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as ADMIN to view statistics.
      </p>
    );
  }

  if (!canAccess) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}.
      </p>
    );
  }

  return (
    <section className="py-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Admin Analytics
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Statistics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            System-wide overview of users, jobs, and applications.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {message ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-4 w-24 rounded bg-slate-200" />
              <div className="mb-2 h-6 w-36 rounded bg-slate-200" />
              <div className="mx-auto h-[260px] w-[260px] rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <PieCard
              title="User Roles"
              subtitle="Distribution"
              data={userRoleData}
              colors={ROLE_COLORS}
            />
            <PieCard
              title="User Statuses"
              subtitle="Status"
              data={userStatusData}
              colors={STATUS_COLORS}
            />
            <PieCard
              title="Job Types"
              subtitle="System-wide"
              data={jobTypeData}
              colors={JOB_TYPE_COLORS}
            />
            <PieCard
              title="Application Status"
              subtitle="All Applications"
              data={applicationStatusData}
              colors={APPLICATION_STATUS_COLORS}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-700">Summary</h3>
            <div className="mt-2 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
              <div className="rounded-xl bg-indigo-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Total Users
                </p>
                <p className="mt-1 text-2xl font-black text-indigo-900">
                  {userRoleData.reduce((s, d) => s + d.value, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Active Users
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-900">
                  {userStatusData.find((d) => d.name === "Active")?.value ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Total Jobs
                </p>
                <p className="mt-1 text-2xl font-black text-amber-900">
                  {jobTypeData.reduce((s, d) => s + d.value, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Applications
                </p>
                <p className="mt-1 text-2xl font-black text-blue-900">
                  {applicationStatusData.reduce((s, d) => s + d.value, 0)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
