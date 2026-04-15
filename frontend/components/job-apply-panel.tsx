"use client";

import { FormEvent, useState } from "react";
import { applyToJob } from "../lib/api";
import { useAuth } from "./auth-provider";

type Props = {
  jobId: number;
};

export default function JobApplyPanel({ jobId }: Props) {
  const { auth, isReady } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentRole = auth?.user.role;
  const canApply = currentRole === "CANDIDATE" || currentRole === "ADMIN";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) {
      setMessage("Please login before applying.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);

    const coverLetter = String(formData.get("coverLetter") || "").trim();
    const cvLink = String(formData.get("cvLink") || "").trim();

    try {
      await applyToJob(auth.token, jobId, {
        coverLetter: coverLetter || undefined,
        cvLink: cvLink || undefined,
      });
      setMessage("Apply success.");
      event.currentTarget.reset();
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Apply failed";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-bold">Quick Apply</h2>
      <p className="mt-1 text-sm text-slate-300">
        Role allowed: CANDIDATE or ADMIN
      </p>

      {!isReady ? (
        <p className="mt-2 text-sm text-slate-300">Loading session...</p>
      ) : null}
      {isReady && !auth ? (
        <p className="mt-2 text-sm text-amber-300">Please login to apply.</p>
      ) : null}
      {isReady && auth && !canApply ? (
        <p className="mt-2 text-sm text-rose-300">
          Current role {auth.user.role} is not allowed to apply.
        </p>
      ) : null}

      <textarea
        name="coverLetter"
        placeholder="Cover letter"
        className="mt-4 h-28 w-full rounded-xl bg-white/10 p-3 text-sm outline-none ring-brand-500 focus:ring"
        disabled={!canApply || isSubmitting}
      />
      <input
        name="cvLink"
        placeholder="CV Link (Google Drive, portfolio...)"
        className="mt-3 w-full rounded-xl bg-white/10 p-3 text-sm outline-none ring-brand-500 focus:ring"
        disabled={!canApply || isSubmitting}
      />
      <button
        type="submit"
        disabled={!canApply || isSubmitting}
        className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Apply Now"}
      </button>

      {message ? (
        <p className="mt-3 text-sm text-slate-100">{message}</p>
      ) : null}
    </form>
  );
}
