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

function formatUnitPrice(priceCents: number, credits: number) {
  if (!credits) return "$0.00";
  return `$${(priceCents / credits / 100).toFixed(2)}`;
}

export default function EmployerBillingPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<BillingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasingId, setIsPurchasingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const featuredPackageId = items.reduce<number | null>((current, pkg) => {
    if (!current) return pkg.id;
    const currentItem = items.find((item) => item.id === current);
    if (!currentItem) return pkg.id;
    return pkg.credits > currentItem.credits ? pkg.id : current;
  }, null);

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
          error instanceof Error
            ? error.message
            : "Cannot load billing packages";
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
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as EMPLOYER to view billing.
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
            Billing Packages
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Choose a package that fits your hiring scale. Credits are used to
            publish jobs and boost visibility.
          </p>
        </div>

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
                error instanceof Error
                  ? error.message
                  : "Cannot load billing packages";
              setMessage(nextMessage);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh Packages"}
        </button>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((pkg) => {
          const isFeatured = featuredPackageId === pkg.id;
          return (
            <article
              key={pkg.id}
              className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                isFeatured
                  ? "border-brand-200 bg-brand-50/60"
                  : "border-slate-200 bg-white"
              }`}
            >
              {isFeatured ? (
                <span className="absolute right-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Best Value
                </span>
              ) : null}

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{pkg.name}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {pkg.credits} credits
                </span>
              </div>

              <p className="mt-4 text-3xl font-black text-slate-900">
                {formatUsdFromCents(pkg.priceCents)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatUnitPrice(pkg.priceCents, pkg.credits)} per credit
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  Publish jobs instantly
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  Priority listing boost
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  Dedicated employer support
                </div>
              </div>

              <button
                type="button"
                onClick={() => onPurchase(pkg.id)}
                disabled={isPurchasingId === pkg.id}
                className={`mt-5 w-full rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                  isFeatured
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {isPurchasingId === pkg.id ? "Processing..." : "Buy Package"}
              </button>
            </article>
          );
        })}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No billing packages available.
        </p>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}
    </section>
  );
}
