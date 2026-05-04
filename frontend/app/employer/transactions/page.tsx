"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { listEmployerTransactions } from "../../../lib/api";
import { EmployerTransaction } from "../../../types";

function formatUsdFromCents(value: number) {
  return `$${(value / 100).toFixed(2)}`;
}

function getStatusStyle(status: EmployerTransaction["status"]) {
  if (status === "SUCCESS") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "FAILED") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function EmployerTransactionsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<EmployerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const totalCredits = items.reduce((sum, item) => sum + item.credits, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.amountCents, 0);
  const lastTransaction = items[0];

  useEffect(() => {
    async function init() {
      if (!auth?.token || auth.user.role !== "EMPLOYER") return;
      setIsLoading(true);
      setMessage("");
      try {
        const data = await listEmployerTransactions(auth.token, {
          page,
          pageSize: 10,
        });
        setItems(data.items);
        setTotalPages(data.pagination.totalPages || 1);
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Cannot load transactions";
        setMessage(nextMessage);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [auth?.token, auth?.user.role, page]);

  if (!isReady) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as EMPLOYER to view transactions.
      </p>
    );
  }

  if (auth.user.role !== "EMPLOYER") {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}.
      </p>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/85 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-slate-100 blur-3xl" />

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Employer Billing
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Transaction History
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Track your billing activity and package usage with a full audit
            trail.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!auth?.token) return;
            setIsLoading(true);
            setMessage("");
            try {
              const data = await listEmployerTransactions(auth.token, {
                page,
                pageSize: 10,
              });
              setItems(data.items);
              setTotalPages(data.pagination.totalPages || 1);
            } catch (error) {
              const nextMessage =
                error instanceof Error
                  ? error.message
                  : "Cannot load transactions";
              setMessage(nextMessage);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh Transactions"}
        </button>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Total Spent
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {formatUsdFromCents(totalSpent)}
          </p>
          <p className="mt-1 text-xs text-slate-500">This page</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Credits Purchased
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {totalCredits}
          </p>
          <p className="mt-1 text-xs text-slate-500">This page</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Latest Transaction
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {lastTransaction?.package.name || "No activity"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {lastTransaction
              ? new Date(lastTransaction.createdAt).toLocaleString()
              : ""}
          </p>
        </article>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.transactionCode}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.package.name}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatUsdFromCents(item.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.credits}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No transactions yet.</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || isLoading}
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-60"
        >
          Prev
        </button>
        <span className="text-xs font-semibold text-slate-600">
          Page {page} / {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() =>
            setPage((prev) => Math.min(Math.max(1, totalPages), prev + 1))
          }
          disabled={page >= totalPages || isLoading}
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-60"
        >
          Next
        </button>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}
    </section>
  );
}
