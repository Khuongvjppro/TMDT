"use client";

import { FormEvent, useState } from "react";
import { createJob } from "../../../../lib/api";
import { useAuth } from "../../../../components/auth-provider";

export default function NewJobPage() {
  const { auth, isReady } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentRole = auth?.user.role;
  const canCreate = currentRole === "EMPLOYER" || currentRole === "ADMIN";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !canCreate) {
      setMessage("Please login with EMPLOYER or ADMIN account.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: String(formData.get("title") || ""),
      companyName: String(formData.get("companyName") || ""),
      location: String(formData.get("location") || ""),
      type: String(formData.get("type") || "FULL_TIME"),
      description: String(formData.get("description") || ""),
      requirements: String(formData.get("requirements") || "")
    };

    try {
      await createJob(auth.token, payload);
      setMessage("Create job success.");
      event.currentTarget.reset();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Create job failed";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Post New Job</h1>
      <p className="mt-1 text-sm text-slate-600">Role allowed: EMPLOYER or ADMIN</p>
      {!isReady ? <p className="mt-2 text-sm text-slate-600">Loading session...</p> : null}
      {isReady && !auth ? <p className="mt-2 text-sm text-amber-700">Please login first.</p> : null}
      {isReady && auth && !canCreate ? (
        <p className="mt-2 text-sm text-rose-700">Current role {auth.user.role} is forbidden to create jobs.</p>
      ) : null}

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <input name="title" placeholder="Job title" className="w-full rounded-xl border px-3 py-2 text-sm" required disabled={!canCreate || isSubmitting} />
        <input name="companyName" placeholder="Company name" className="w-full rounded-xl border px-3 py-2 text-sm" required disabled={!canCreate || isSubmitting} />
        <input name="location" placeholder="Location" className="w-full rounded-xl border px-3 py-2 text-sm" required disabled={!canCreate || isSubmitting} />
        <select name="type" className="w-full rounded-xl border px-3 py-2 text-sm" disabled={!canCreate || isSubmitting}>
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="INTERN">Intern</option>
          <option value="FREELANCE">Freelance</option>
          <option value="REMOTE">Remote</option>
        </select>
        <textarea name="description" placeholder="Description" className="h-32 w-full rounded-xl border px-3 py-2 text-sm" required disabled={!canCreate || isSubmitting} />
        <textarea name="requirements" placeholder="Requirements" className="h-32 w-full rounded-xl border px-3 py-2 text-sm" required disabled={!canCreate || isSubmitting} />
        <button type="submit" disabled={!canCreate || isSubmitting} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {isSubmitting ? "Creating..." : "Create Job"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
