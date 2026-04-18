"use client";

import { useAuth } from "../../../components/auth-provider";

const MOCK_TRANSACTIONS = [
  { id: "TXN-1001", packageName: "Starter", amount: "$19", status: "SUCCESS", date: "2026-04-10" },
  { id: "TXN-1002", packageName: "Growth", amount: "$45", status: "PENDING", date: "2026-04-12" },
];

export default function EmployerTransactionsPage() {
  const { auth, isReady } = useAuth();

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return <p className="rounded-2xl bg-white p-4 shadow">Please login as EMPLOYER to view transactions.</p>;
  }

  if (auth.user.role !== "EMPLOYER") {
    return <p className="rounded-2xl bg-white p-4 shadow">Forbidden for role {auth.user.role}.</p>;
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Transaction History</h1>
      <p className="text-sm text-slate-600">
        White feature skeleton: transaction history mock table for future payment flow.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-4">Transaction ID</th>
              <th className="py-2 pr-4">Package</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_TRANSACTIONS.map((item) => (
              <tr key={item.id}>
                <td className="py-2 pr-4">{item.id}</td>
                <td className="py-2 pr-4">{item.packageName}</td>
                <td className="py-2 pr-4">{item.amount}</td>
                <td className="py-2 pr-4">{item.status}</td>
                <td className="py-2 pr-4">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
