"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import {
  listEmployerBillingPackages,
  purchaseEmployerBillingPackage,
} from "../../../lib/api";
import { BillingPackage } from "../../../types";

function formatUsdFromCents(value: number) {
  return `$${(value / 100).toFixed(2)}`;
}

export default function EmployerBillingPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<BillingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasingId, setIsPurchasingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      if (!auth?.token || auth.user.role !== "EMPLOYER") return;
      setIsLoading(true);
      setMessage("");
      try {
        const data = await listEmployerBillingPackages(auth.token);
        setItems(data.items);
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Cannot load billing packages";
        setMessage(nextMessage);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [auth?.token, auth?.user.role]);

  async function onPurchase(packageId: number) {
    if (!auth?.token) return;
    setIsPurchasingId(packageId);
    setMessage("");
    try {
      const data = await purchaseEmployerBillingPackage(auth.token, packageId);
      setMessage(
        `Purchase success: ${data.item.package.name} (${data.item.credits} credits) - ${data.item.transactionCode}`,
      );
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Purchase package failed";
      setMessage(nextMessage);
    } finally {
      setIsPurchasingId(null);
    }
  }

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
      <p className="text-sm text-slate-600">Choose a package and create a billing transaction.</p>

      <button
        type="button"
        onClick={async () => {
          if (!auth?.token) return;
          setIsLoading(true);
          setMessage("");
          try {
            const data = await listEmployerBillingPackages(auth.token);
            setItems(data.items);
          } catch (error) {
            const nextMessage =
              error instanceof Error ? error.message : "Cannot load billing packages";
            setMessage(nextMessage);
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Refreshing..." : "Refresh Packages"}
      </button>

      <div className="grid gap-3 md:grid-cols-3">
        {items.map((pkg) => (
          <article key={pkg.id} className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">{pkg.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{pkg.credits} credits</p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {formatUsdFromCents(pkg.priceCents)}
            </p>
            <button
              type="button"
              onClick={() => onPurchase(pkg.id)}
              disabled={isPurchasingId === pkg.id}
              className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isPurchasingId === pkg.id ? "Processing..." : "Buy Package"}
            </button>
          </article>
        ))}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-slate-600">No billing packages available.</p>
      ) : null}

      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
