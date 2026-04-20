"use client";

import { useEffect, useState } from "react";
import { getSavedJobStatus, saveJob, unsaveJob } from "../lib/api";
import { useAuth } from "./auth-provider";

type SaveJobToggleProps = {
  jobId: number;
  compact?: boolean;
};

export default function SaveJobToggle({ jobId, compact = false }: SaveJobToggleProps) {
  const { auth, isReady } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canUseSavedJobs = auth?.user.role === "CANDIDATE";

  useEffect(() => {
    let ignore = false;

    async function loadStatus() {
      if (!auth?.token || !canUseSavedJobs) {
        setIsSaved(false);
        return;
      }

      try {
        const response = await getSavedJobStatus(auth.token, jobId);
        if (!ignore) {
          setIsSaved(response.isSaved);
        }
      } catch {
        if (!ignore) {
          setMessage("Cannot load saved status");
        }
      }
    }

    loadStatus();
    return () => {
      ignore = true;
    };
  }, [auth?.token, canUseSavedJobs, jobId]);

  async function onToggle() {
    if (!auth?.token || !canUseSavedJobs) return;

    setIsLoading(true);
    setMessage("");
    try {
      if (isSaved) {
        await unsaveJob(auth.token, jobId);
        setIsSaved(false);
        setMessage("Removed from saved jobs");
      } else {
        await saveJob(auth.token, jobId);
        setIsSaved(true);
        setMessage("Saved job successfully");
      }
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot update saved jobs";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isReady) {
    return null;
  }

  if (!auth) {
    return compact ? null : (
      <p className="text-sm text-slate-600">Login as CANDIDATE to save this job.</p>
    );
  }

  if (!canUseSavedJobs) {
    return compact ? null : (
      <p className="text-sm text-slate-600">
        Saved jobs is available for CANDIDATE role only.
      </p>
    );
  }

  return (
    <div className={compact ? "" : "space-y-2"}>
      <button
        type="button"
        disabled={isLoading}
        onClick={onToggle}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60"
      >
        {isLoading ? "Updating..." : isSaved ? "Unsave Job" : "Save Job"}
      </button>
      {!compact && message ? (
        <p className="text-sm text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
