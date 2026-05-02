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

  function getInitials(name: string) {
    if (!name) return "NA";
    const letters = name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]);
    return letters.slice(0, 2).join("").toUpperCase() || "NA";
  }

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
    <section className="space-y-6 rounded-[28px] border border-slate-100 bg-white/80 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Candidate Sourcing
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Discover the right people faster
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Search candidate profiles by name, email, phone, bio, or CV link.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Results
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {pageInfo.total}
          </p>
          <p className="text-[11px] text-slate-500">candidates found</p>
        </div>
      </div>

      <form
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
        onSubmit={onSubmit}
      >
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-400">🔍</span>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search name, email, phone, or bio"
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const initials = getInitials(item.fullName);
          const hasCv = Boolean(item.candidateProfile?.cvLink);
          const phone = item.candidateProfile?.phone || "N/A";
          const bio = item.candidateProfile?.bio || "No bio";

          return (
            <article
              key={item.id}
              className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {initials || "NA"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.fullName}
                    </h2>
                    <p className="text-xs text-slate-500">{item.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {item._count.applications} apps
                </span>
              </div>

              <div className="mt-4 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Phone:</span>{" "}
                  {phone}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Status:</span>{" "}
                  {hasCv ? "CV ready" : "CV missing"}
                </p>
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-slate-700">{bio}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {hasCv ? (
                  <a
                    href={item.candidateProfile?.cvLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Open CV
                    <span aria-hidden className="text-sm">
                      ↗
                    </span>
                  </a>
                ) : (
                  <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500">
                    No CV link
                  </span>
                )}
                <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-slate-800">
                  View profile
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-600">
          No candidates matched your query.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Page {pageInfo.page} / {Math.max(pageInfo.totalPages, 1)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading || pageInfo.page <= 1}
            onClick={() => loadData(pageInfo.page - 1, q.trim())}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={isLoading || pageInfo.page >= pageInfo.totalPages}
            onClick={() => loadData(pageInfo.page + 1, q.trim())}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>

      {message ? (
        <p className="text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
