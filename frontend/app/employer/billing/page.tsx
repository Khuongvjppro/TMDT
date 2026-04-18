"use client";

import { useAuth } from "../../../components/auth-provider";

const PACKAGES = [
  { id: 1, name: "Starter", credits: 30, price: "$19" },
  { id: 2, name: "Growth", credits: 80, price: "$45" },
  { id: 3, name: "Scale", credits: 180, price: "$89" },
];

export default function EmployerBillingPage() {
  const { auth, isReady } = useAuth();

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return <p className="rounded-2xl bg-white p-4 shadow">Please login as EMPLOYER to view billing.</p>;
  }

  if (auth.user.role !== "EMPLOYER") {
    return <p className="rounded-2xl bg-white p-4 shadow">Forbidden for role {auth.user.role}.</p>;
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Billing Packages</h1>
      <p className="text-sm text-slate-600">
        White feature skeleton: package list for future payment integration.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <article key={pkg.id} className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">{pkg.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{pkg.credits} credits</p>
            <p className="mt-2 text-xl font-black text-slate-900">{pkg.price}</p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Select (Coming Soon)
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
