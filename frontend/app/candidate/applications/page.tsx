"use client";

import { useEffect, useState } from "react";
import { listMyApplications } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { CandidateApplication } from "../../../types";

export default function CandidateApplicationsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canAccess = auth?.user.role === "CANDIDATE";

  async function loadData() {
    if (!auth?.token || !canAccess) return;
    setIsLoading(true);
    setMessage("");
    try {
      const data = await listMyApplications(auth.token);
      setItems(data.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load applications";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [auth?.token, canAccess]);

  if (!isReady) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as CANDIDATE to view your applications.
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
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black text-slate-900">My Applications</h1>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((application) => (
          <article
            key={application.id}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <p className="text-xs font-semibold text-slate-500">
              #{application.id} • {application.status}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {application.job.title}
            </h2>
            <p className="text-sm text-slate-600">
              {application.job.companyName} • {application.job.location}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Applied at {new Date(application.createdAt).toLocaleString()}
            </p>
            {application.cvLink ? (
              <p className="mt-2 text-xs text-slate-600">
                CV: {application.cvLink}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-slate-600">You have no applications yet.</p>
      ) : null}

      {message ? (
        <p className="text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
