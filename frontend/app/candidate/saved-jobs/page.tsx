"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listSavedJobs, unsaveJob } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { SavedJobItem } from "../../../types";

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Negotiable";
  if (min && max) return `$${min} - $${max}`;
  return `$${min || max}+`;
}

export default function CandidateSavedJobsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<SavedJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadSavedJobs(token: string) {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await listSavedJobs(token);
      setItems(response.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load saved jobs";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!auth?.token || auth.user.role !== "CANDIDATE") return;
    loadSavedJobs(auth.token);
  }, [auth?.token, auth?.user.role]);

  async function onUnsave(jobId: number) {
    if (!auth?.token) return;
    setRemovingJobId(jobId);
    setMessage("");

    try {
      await unsaveJob(auth.token, jobId);
      setItems((prev) => prev.filter((item) => item.jobId !== jobId));
      setMessage("Removed job from saved list");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot unsave job";
      setMessage(nextMessage);
    } finally {
      setRemovingJobId(null);
    }
  }

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as CANDIDATE to view saved jobs.
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
      <h1 className="text-2xl font-black text-slate-900">Saved Jobs</h1>
      <p className="text-sm text-slate-600">
        Manage jobs you saved for later application.
      </p>

      <button
        type="button"
        onClick={() => auth?.token && loadSavedJobs(auth.token)}
        disabled={isLoading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Refreshing..." : "Refresh"}
      </button>

      {items.length === 0 && !isLoading ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          You have no saved jobs yet.
        </p>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 p-4 text-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {item.job.type.replace("_", " ")}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{item.job.title}</h2>
            <p className="text-slate-600">
              {item.job.companyName} • {item.job.location}
            </p>
            <p className="mt-2 text-accent">
              {formatSalary(item.job.salaryMin, item.job.salaryMax)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Min experience: {item.job.minExperienceYears ?? 0} year(s)
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/jobs/${item.job.id}`}
                className="rounded-lg border border-slate-300 px-3 py-1.5"
              >
                View Details
              </Link>
              <button
                type="button"
                onClick={() => onUnsave(item.jobId)}
                disabled={removingJobId === item.jobId}
                className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700 disabled:opacity-60"
              >
                {removingJobId === item.jobId ? "Removing..." : "Unsave"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
