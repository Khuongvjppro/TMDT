"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteJob, listEmployerJobs, setJobActive } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { Job } from "../../../types";

export default function EmployerJobsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const canAccess = auth?.user.role === "EMPLOYER";

  async function loadData() {
    if (!auth?.token || !canAccess) return;
    setIsLoading(true);
    setMessage("");
    try {
      const data = await listEmployerJobs(auth.token);
      setItems(data.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load jobs";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [auth?.token, canAccess]);

  async function onDelete(jobId: number) {
    if (!auth?.token) return;
    setDeletingId(jobId);
    setMessage("");
    try {
      await deleteJob(auth.token, jobId);
      setItems((prev) => prev.filter((item) => item.id !== jobId));
      setMessage(`Deleted job #${jobId}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Delete job failed";
      setMessage(nextMessage);
    } finally {
      setDeletingId(null);
    }
  }

  async function onToggleActive(jobId: number, nextStatus: boolean) {
    if (!auth?.token) return;
    setStatusUpdatingId(jobId);
    setMessage("");
    try {
      const data = await setJobActive(auth.token, jobId, nextStatus);
      setItems((prev) =>
        prev.map((item) =>
          item.id === jobId ? { ...item, isActive: data.item.isActive } : item,
        ),
      );
      setMessage(
        nextStatus
          ? `Re-activated job #${jobId}`
          : `Hidden job #${jobId}`,
      );
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update job status failed";
      setMessage(nextMessage);
    } finally {
      setStatusUpdatingId(null);
    }
  }

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return <p className="rounded-2xl bg-white p-4 shadow">Please login as EMPLOYER to manage jobs.</p>;
  }

  if (!canAccess) {
    return <p className="rounded-2xl bg-white p-4 shadow">Forbidden for role {auth.user.role}.</p>;
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black text-slate-900">My Jobs</h1>
        <Link
          href="/employer/jobs/new"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Create New Job
        </Link>
      </div>
      <p className="text-sm text-slate-600">Employer white feature: list and manage own jobs.</p>

      <button
        type="button"
        onClick={loadData}
        disabled={isLoading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Refreshing..." : "Refresh Jobs"}
      </button>

      <div className="space-y-3">
        {items.map((job) => (
          <article key={job.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">#{job.id} • {job.type}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{job.title}</h2>
            <p className="text-sm text-slate-600">{job.companyName} • {job.location}</p>
            <p className="mt-1 text-xs text-slate-500">Status: {job.isActive ? "ACTIVE" : "INACTIVE"}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/employer/jobs/${job.id}/edit`}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Edit
              </Link>
              <Link
                href={`/employer/jobs/${job.id}/applications`}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Applications
              </Link>
              <button
                type="button"
                onClick={() => onToggleActive(job.id, !job.isActive)}
                disabled={statusUpdatingId === job.id}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
              >
                {statusUpdatingId === job.id
                  ? "Updating..."
                  : job.isActive
                    ? "Hide"
                    : "Show"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(job.id)}
                disabled={deletingId === job.id}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
              >
                {deletingId === job.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-slate-600">No jobs found. Create your first job.</p>
      ) : null}

      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
