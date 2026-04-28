"use client";

import { FormEvent, useEffect, useState } from "react";
import { listEmployerCandidates } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { EmployerCandidate } from "../../../types";

export default function EmployerCandidatesPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<EmployerCandidate[]>([]);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const canAccess = auth?.user.role === "EMPLOYER";

  async function loadData(nextPage = 1, keyword = q) {
    if (!auth?.token || !canAccess) return;
    setIsLoading(true);
    setMessage("");
    try {
      const data = await listEmployerCandidates(auth.token, {
        page: nextPage,
        pageSize: pageInfo.pageSize,
        q: keyword,
      });
      setItems(data.items);
      setPageInfo(data.pagination);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load candidates";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData(1, "");
  }, [auth?.token, canAccess]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadData(1, q.trim());
  }

  if (!isReady) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as EMPLOYER to search candidates.
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
      <h1 className="text-2xl font-black text-slate-900">Candidate Sourcing</h1>
      <p className="text-sm text-slate-600">
        UC20 white feature: search candidate profiles by name, email, phone,
        bio, or cv link.
      </p>

      <form className="flex flex-wrap items-center gap-2" onSubmit={onSubmit}>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search keyword"
          className="min-w-[260px] rounded-xl border px-3 py-2 text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      <p className="text-xs text-slate-500">
        {pageInfo.total} candidates found
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <h2 className="text-lg font-bold text-slate-900">
              {item.fullName}
            </h2>
            <p className="text-sm text-slate-600">{item.email}</p>
            <p className="text-xs text-slate-500">
              Phone: {item.candidateProfile?.phone || "N/A"}
            </p>
            <p className="text-xs text-slate-500">
              Applications: {item._count.applications}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {item.candidateProfile?.bio || "No bio"}
            </p>
            {item.candidateProfile?.cvLink ? (
              <a
                href={item.candidateProfile.cvLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Open CV Link
              </a>
            ) : null}
          </article>
        ))}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-slate-600">
          No candidates matched your query.
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isLoading || pageInfo.page <= 1}
          onClick={() => loadData(pageInfo.page - 1, q.trim())}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
        >
          Previous
        </button>
        <p className="text-xs text-slate-600">
          Page {pageInfo.page} / {Math.max(pageInfo.totalPages, 1)}
        </p>
        <button
          type="button"
          disabled={isLoading || pageInfo.page >= pageInfo.totalPages}
          onClick={() => loadData(pageInfo.page + 1, q.trim())}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
        >
          Next
        </button>
      </div>

      {message ? (
        <p className="text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
