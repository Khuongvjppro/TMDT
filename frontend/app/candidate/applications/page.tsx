"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchMyApplications,
  fetchMyApplicationSummary,
  withdrawMyApplication,
} from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { ApplicationItem, ApplicationStatus, ApplicationSummary } from "../../../types";

const statusOptions: Array<{ value: ApplicationStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

const emptySummary: ApplicationSummary = {
  total: 0,
  byStatus: {
    PENDING: 0,
    REVIEWING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  },
};

function formatDate(input: string) {
  return new Date(input).toLocaleString();
}

export default function CandidateApplicationsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [summary, setSummary] = useState<ApplicationSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [message, setMessage] = useState("");

  const canWithdraw = (status: ApplicationStatus) =>
    status === "PENDING" || status === "REVIEWING";

  async function loadData(token: string) {
    setIsLoading(true);
    setMessage("");

    try {
      const [applicationsResponse, summaryResponse] = await Promise.all([
        fetchMyApplications(token),
        fetchMyApplicationSummary(token),
      ]);
      setItems(applicationsResponse.items);
      setSummary(summaryResponse.item);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load applications";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!auth?.token || auth.user.role !== "CANDIDATE") return;
    loadData(auth.token);
  }, [auth?.token, auth?.user.role]);

  async function onWithdraw(applicationId: number) {
    if (!auth?.token) return;
    const accepted = window.confirm(
      "Are you sure you want to withdraw this application?",
    );
    if (!accepted) return;

    setWithdrawingId(applicationId);
    setMessage("");
    try {
      await withdrawMyApplication(auth.token, applicationId);
      await loadData(auth.token);
      setMessage("Application withdrawn successfully.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot withdraw application";
      setMessage(nextMessage);
    } finally {
      setWithdrawingId(null);
    }
  }

  const filteredItems = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as CANDIDATE to view applications.
      </p>
    );
  }

  if (auth.user.role !== "CANDIDATE") {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}. Login as CANDIDATE to use this page.
      </p>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">My Applications</h1>
      <p className="text-sm text-slate-600">
        Track your application progress by status.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900">{summary.total}</p>
        </article>
        <article className="rounded-xl border border-amber-200 p-3">
          <p className="text-xs uppercase text-amber-700">Pending</p>
          <p className="text-xl font-bold text-amber-900">{summary.byStatus.PENDING}</p>
        </article>
        <article className="rounded-xl border border-blue-200 p-3">
          <p className="text-xs uppercase text-blue-700">Reviewing</p>
          <p className="text-xl font-bold text-blue-900">{summary.byStatus.REVIEWING}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 p-3">
          <p className="text-xs uppercase text-emerald-700">Accepted</p>
          <p className="text-xl font-bold text-emerald-900">{summary.byStatus.ACCEPTED}</p>
        </article>
        <article className="rounded-xl border border-rose-200 p-3">
          <p className="text-xs uppercase text-rose-700">Rejected</p>
          <p className="text-xl font-bold text-rose-900">{summary.byStatus.REJECTED}</p>
        </article>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="status-filter">
          Filter status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as ApplicationStatus | "ALL")
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => auth?.token && loadData(auth.token)}
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {filteredItems.length === 0 && !isLoading ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No applications found for current filter.
        </p>
      ) : null}

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {item.job.type.replace("_", " ")}
              </p>
              <p className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {item.status}
              </p>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{item.job.title}</h2>
            <p className="text-slate-600">
              {item.job.companyName} • {item.job.location}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Applied at: {formatDate(item.createdAt)}
            </p>
            {item.cvLink ? (
              <p className="mt-1 text-xs text-slate-500">CV: {item.cvLink}</p>
            ) : null}
            {item.coverLetter ? (
              <p className="mt-2 line-clamp-2 text-xs text-slate-600">{item.coverLetter}</p>
            ) : null}

            <div className="mt-3">
              <Link
                href={`/jobs/${item.jobId}`}
                className="rounded-lg border border-slate-300 px-3 py-1.5"
              >
                View Job
              </Link>
              {canWithdraw(item.status) ? (
                <button
                  type="button"
                  onClick={() => onWithdraw(item.id)}
                  disabled={withdrawingId === item.id}
                  className="ml-2 rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700 disabled:opacity-60"
                >
                  {withdrawingId === item.id ? "Withdrawing..." : "Withdraw"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
