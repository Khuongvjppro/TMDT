"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { listEmployerTransactions } from "../../../lib/api";
import { EmployerTransaction } from "../../../types";

function formatUsdFromCents(value: number) {
  return `$${(value / 100).toFixed(2)}`;
}

export default function EmployerTransactionsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<EmployerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">
        Transaction History
      </h1>
      <p className="text-sm text-slate-600">
        Your billing transactions are listed here.
      </p>

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
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Refreshing..." : "Refresh Transactions"}
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-4">Transaction ID</th>
              <th className="py-2 pr-4">Package</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Credits</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 pr-4">{item.transactionCode}</td>
                <td className="py-2 pr-4">{item.package.name}</td>
                <td className="py-2 pr-4">
                  {formatUsdFromCents(item.amountCents)}
                </td>
                <td className="py-2 pr-4">{item.credits}</td>
                <td className="py-2 pr-4">{item.status}</td>
                <td className="py-2 pr-4">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-slate-600">No transactions yet.</p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || isLoading}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
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
