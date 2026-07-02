"use client";

import { useEffect, useState } from "react";
import { getSavedJobStatus, saveJob, unsaveJob } from "../lib/api";
import { useAuth } from "./auth-provider";

export default function SaveJobButton({ jobId, compact = false }: { jobId: number; compact?: boolean }) {
  const { auth } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const isCandidate = auth?.user.role === "CANDIDATE";

  useEffect(() => {
    let active = true;
    if (!auth?.token || !isCandidate) {
      setSaved(false);
      return;
    }
    getSavedJobStatus(auth.token, jobId)
      .then((data) => { if (active) setSaved(data.saved); })
      .catch(() => { if (active) setSaved(false); });
    return () => { active = false; };
  }, [auth?.token, isCandidate, jobId]);

  async function toggle() {
    if (!auth?.token || !isCandidate || busy) return;
    setBusy(true);
    try {
      if (saved) await unsaveJob(auth.token, jobId);
      else await saveJob(auth.token, jobId);
      setSaved((value) => !value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!isCandidate || busy}
      title={!auth ? "Log in as a candidate to save jobs" : saved ? "Remove from saved jobs" : "Save job"}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      className={compact
        ? `flex h-7 w-7 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${saved ? "border-brand-600 bg-brand-600 text-white" : "border-brand-200 text-brand-600 hover:bg-brand-50"}`
        : `rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${saved ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`}
    >
      {compact ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6c-1.7-1.6-4.4-1.6-6 0L12 7.4l-2.8-2.8c-1.7-1.6-4.4-1.6-6 0-1.8 1.7-1.8 4.5 0 6.2l8.8 8.6 8.8-8.6c1.8-1.7 1.8-4.5 0-6.2z" /></svg>
      ) : saved ? "Saved" : "Save Job"}
    </button>
  );
}
