"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import {
  getEmployerProfile,
  listEmployerBillingPackages,
  purchaseEmployerBillingPackage,
  purchaseEmployerBillingPackageInstant,
} from "../../../lib/api";
import { BillingPackage } from "../../../types";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatUnitPrice(price: number, maxJobPosts: number) {
  if (!maxJobPosts) return formatVnd(0);
  return formatVnd(Math.round(price / maxJobPosts));
}

function getPackageFeatures(name: string, maxJobPosts: number) {
  if (name === "Starter") {
    return [
      `Publish up to ${maxJobPosts} jobs`,
      "Starter Boost (Level 1) unlocked",
      "Standard email support (48h)",
      "Access to applications manager",
    ];
  }
  if (name === "Growth") {
    return [
      `Publish up to ${maxJobPosts} jobs`,
      "Growth Boost (Level 2) unlocked",
      "Priority listing style (Purple outline)",
      "24/7 Dedicated priority support",
    ];
  }
  if (name === "Scale") {
    return [
      `Publish up to ${maxJobPosts} jobs`,
      "Scale Boost (Level 3) unlocked",
      "Homepage banner featured highlights",
      "Dedicated account manager",
    ];
  }
  return [
    `Publish up to ${maxJobPosts} jobs`,
    "Priority listing boost",
    "Dedicated employer support",
  ];
}

export default function EmployerBillingPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<BillingPackage[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasingId, setIsPurchasingId] = useState<number | null>(null);
  const [isInstantPurchasingId, setIsInstantPurchasingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const featuredPackageId = items.reduce<number | null>((current, pkg) => {
    if (!current) return pkg.id;
    const currentItem = items.find((item) => item.id === current);
    if (!currentItem) return pkg.id;
    return pkg.maxJobPosts > currentItem.maxJobPosts ? pkg.id : current;
  }, null);

  async function loadBillingDetails() {
    if (!auth?.token || auth.user.role !== "EMPLOYER") return;
    setIsLoading(true);
    setMessage("");
    setMessageType(null);
    try {
      const [packagesData, profileData] = await Promise.all([
        listEmployerBillingPackages(auth.token),
        getEmployerProfile(auth.token),
      ]);
      setItems(packagesData.items);
      setCredits(profileData.item.credits ?? 0);
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "Cannot load billing details";
      setMessage(nextMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBillingDetails();
  }, [auth?.token, auth?.user.role]);

  async function onPurchase(packageId: number) {
    if (!auth?.token) return;
    setIsPurchasingId(packageId);
    setMessage("");
    setMessageType(null);
    try {
      const data = await purchaseEmployerBillingPackage(auth.token, packageId);
      setMessage("Redirecting to VNPAY Sandbox...");
      setMessageType("success");
      window.location.assign(data.paymentUrl);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Purchase package failed";
      setMessage(nextMessage);
      setMessageType("error");
    } finally {
      setIsPurchasingId(null);
    }
  }

  async function onPurchaseInstant(packageId: number) {
    if (!auth?.token) return;
    setIsInstantPurchasingId(packageId);
    setMessage("");
    setMessageType(null);
    try {
      const data = await purchaseEmployerBillingPackageInstant(auth.token, packageId);
      setMessage(
        `Instant purchase success: Added ${data.item.credits} job-post credits to your balance! (Code: ${data.item.transactionCode})`
      );
      setMessageType("success");
      setCredits((prev) => (prev !== null ? prev + data.item.credits : data.item.credits));
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Instant purchase failed";
      setMessage(nextMessage);
      setMessageType("error");
    } finally {
      setIsInstantPurchasingId(null);
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

        <div className="flex flex-wrap items-center gap-3">
          {credits !== null ? (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm animate-pulse">
              Current Balance: {credits} Credits
            </span>
          ) : null}
        </div>
      </header>

      {message ? (
        <div
          className={`mt-6 rounded-2xl border p-4 text-sm font-semibold shadow-sm ${
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((pkg) => {
          const isFeatured = featuredPackageId === pkg.id;
          const features = getPackageFeatures(pkg.name, pkg.maxJobPosts);

          let cardStyles = "border-slate-200 bg-white hover:border-slate-300";
          let dotColor = "bg-slate-500";
          let buttonStyles = "bg-slate-900 text-white hover:bg-slate-800";

          if (pkg.name === "Growth") {
            cardStyles = "border-indigo-200 bg-gradient-to-br from-indigo-50/20 to-white hover:border-indigo-400 hover:shadow-indigo-500/5";
            dotColor = "bg-indigo-500";
            buttonStyles = "bg-indigo-600 text-white hover:bg-indigo-700";
          } else if (pkg.name === "Scale") {
            cardStyles = "border-amber-300 bg-gradient-to-br from-amber-50/30 to-white ring-2 ring-amber-500/10 hover:border-amber-500 hover:shadow-amber-500/5";
            dotColor = "bg-amber-500";
            buttonStyles = "bg-amber-600 text-white hover:bg-amber-700";
          }

          return (
            <article
              key={pkg.id}
              className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${cardStyles}`}
            >
              {pkg.name === "Scale" ? (
                <span className="absolute right-4 top-4 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Best Value
                </span>
              ) : null}

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{pkg.name}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {pkg.maxJobPosts} Credits
                </span>
              </div>

              <p className="mt-4 text-3xl font-black text-slate-900">
                {formatVnd(pkg.price)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {pkg.durationDays} days · {formatUnitPrice(pkg.price, pkg.maxJobPosts)} / credit
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => onPurchase(pkg.id)}
                  disabled={isPurchasingId === pkg.id || isInstantPurchasingId !== null}
                  className={`w-full rounded-full px-4 py-2 text-xs font-bold transition disabled:opacity-60 ${buttonStyles}`}
                >
                  {isPurchasingId === pkg.id ? "Opening VNPAY..." : "Pay with VNPAY (Sandbox)"}
                </button>

                <button
                  type="button"
                  onClick={() => onPurchaseInstant(pkg.id)}
                  disabled={isInstantPurchasingId === pkg.id || isPurchasingId !== null}
                  className={`w-full rounded-full border border-dashed px-4 py-2 text-xs font-bold transition disabled:opacity-60 ${
                    pkg.name === "Scale"
                      ? "border-amber-300 bg-amber-50/50 text-amber-800 hover:bg-amber-100"
                      : pkg.name === "Growth"
                        ? "border-indigo-300 bg-indigo-50/50 text-indigo-800 hover:bg-indigo-100"
                        : "border-slate-300 bg-slate-50/50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {isInstantPurchasingId === pkg.id
                    ? "Purchasing..."
                    : "Instant Buy (Mock - 1-Click)"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No billing packages available.
        </p>
      ) : null}

      <p className="mt-6 text-xs text-slate-500">
        * Payments are processed in sandbox. Choose **Pay with VNPAY** to test simulated sandbox bank transactions, or use **Instant Buy** to immediately top up credits for local testing.
      </p>
    </section>
  );
}
