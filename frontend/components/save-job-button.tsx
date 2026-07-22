"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { getSavedJobStatus, saveJob, unsaveJob } from "../lib/api";

type Props = {
  jobId: number;
  variant?: "icon" | "button";
};

export default function SaveJobButton({ jobId, variant = "button" }: Props) {
  const { auth } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSavedStatus() {
      if (auth?.token && auth.user.role === "CANDIDATE") {
        try {
          const res = await getSavedJobStatus(auth.token, jobId);
          setIsSaved(res.saved);
        } catch (e) {
          console.error("Failed to check saved status from backend", e);
        }
      } else {
        try {
          const rawSaved = localStorage.getItem("jobfinder_saved_jobs");
          const savedIds: number[] = rawSaved ? JSON.parse(rawSaved) : [];
          setIsSaved(savedIds.includes(jobId));
        } catch (e) {
          console.error("Failed to read saved jobs", e);
        }
      }
    }
    checkSavedStatus();
  }, [jobId, auth?.token, auth?.user?.role]);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      if (auth?.token && auth.user.role === "CANDIDATE") {
        if (isSaved) {
          await unsaveJob(auth.token, jobId);
          setIsSaved(false);
        } else {
          await saveJob(auth.token, jobId);
          setIsSaved(true);
        }
      } else {
        const rawSaved = localStorage.getItem("jobfinder_saved_jobs");
        let savedIds: number[] = rawSaved ? JSON.parse(rawSaved) : [];
        const nextSaved = !isSaved;

        if (nextSaved) {
          if (!savedIds.includes(jobId)) {
            savedIds.push(jobId);
          }
        } else {
          savedIds = savedIds.filter((id) => id !== jobId);
        }

        localStorage.setItem("jobfinder_saved_jobs", JSON.stringify(savedIds));
        setIsSaved(nextSaved);
      }
    } catch (e) {
      console.error("Failed to toggle saved job", e);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition duration-300 ${
          isSaved
            ? "border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm"
            : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        }`}
        aria-label={isSaved ? "Remove from saved" : "Save job"}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform duration-300 ${
            isSaved ? "fill-emerald-600 stroke-emerald-600 scale-110" : "fill-none stroke-currentColor"
          }`}
          strokeWidth="2.5"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`w-full flex items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition duration-300 ${
        isSaved
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 transition-transform duration-300 ${
          isSaved ? "fill-emerald-600 stroke-emerald-600 scale-110" : "text-slate-400 fill-none stroke-currentColor"
        }`}
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
      <span>{isSaved ? "Saved" : "Save Job Listing"}</span>
    </button>
  );
}
