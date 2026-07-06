"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../../../../components/auth-provider";
import { getEmployerTransaction } from "../../../../lib/api";

const RESULT_CONTENT: Record<
  string,
  { title: string; description: string; tone: string }
> = {
  success: {
    title: "Payment successful",
    description: "VNPAY confirmed the payment and your job-post credits were added.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  failed: {
    title: "Payment was not completed",
    description: "VNPAY declined or cancelled this transaction. No credits were added.",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  pending: {
    title: "Payment confirmation pending",
    description: "The transaction is waiting for a valid VNPAY confirmation. Credits have not been added yet.",
    tone: "border-blue-200 bg-blue-50 text-blue-900",
  },
  invalid_signature: {
    title: "Payment verification failed",
    description: "The callback signature was invalid. No credits were added.",
    tone: "border-red-200 bg-red-50 text-red-900",
  },
  invalid_amount: {
    title: "Payment amount mismatch",
    description: "The returned amount did not match the order. No credits were added.",
    tone: "border-red-200 bg-red-50 text-red-900",
  },
  not_found: {
    title: "Transaction not found",
    description: "The returned VNPAY transaction does not exist in JobFinder.",
    tone: "border-red-200 bg-red-50 text-red-900",
  },
};

function PaymentResultContent() {
  const { auth, isReady } = useAuth();
  const searchParams = useSearchParams();
  const callbackStatus = searchParams.get("status") || "failed";
  const transactionCode = searchParams.get("transactionCode");
  const responseCode = searchParams.get("responseCode");
  const [storedStatus, setStoredStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const status = storedStatus || callbackStatus;
  const content = RESULT_CONTENT[status] || RESULT_CONTENT.failed;

  useEffect(() => {
    if (!isReady || !auth?.token || !transactionCode) return;
    let active = true;
    setIsChecking(true);
    getEmployerTransaction(auth.token, transactionCode)
      .then(({ item }) => {
        if (!active) return;
        setStoredStatus(item.status.toLowerCase());
      })
      .catch(() => {
        // Keep the signed callback result when the authenticated lookup fails.
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, isReady, transactionCode]);

  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className={`rounded-2xl border p-5 ${content.tone}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          VNPAY Sandbox
        </p>
        <h1 className="mt-2 text-2xl font-black">{content.title}</h1>
        <p className="mt-2 text-sm opacity-80">{content.description}</p>
        {isChecking ? (
          <p className="mt-2 text-xs font-semibold">Checking stored transaction status...</p>
        ) : null}
      </div>

      <dl className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Transaction code</dt>
          <dd className="break-all text-right font-semibold text-slate-900">
            {transactionCode || "Unavailable"}
          </dd>
        </div>
        {responseCode ? (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">VNPAY response code</dt>
            <dd className="font-semibold text-slate-900">{responseCode}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/employer/billing"
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to billing
        </Link>
        <Link
          href="/employer/transactions"
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View transactions
        </Link>
      </div>
    </section>
  );
}

export default function VnpayResultPage() {
  return (
    <Suspense fallback={<p className="rounded-2xl bg-white p-4 shadow">Verifying payment...</p>}>
      <PaymentResultContent />
    </Suspense>
  );
}
