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
      requirements: String(formData.get("requirements") || ""),
    };

    try {
      await createJob(auth.token, payload);
      setMessage("Create job success.");
      event.currentTarget.reset();
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Create job failed";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-slate-100 blur-3xl" />

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Employer Workspace
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Post New Job
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Create a job post with clear requirements to attract the right
            candidates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Role allowed: EMPLOYER or ADMIN
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            Step 1 of 2
          </span>
        </div>
      </div>
      {!isReady ? (
        <p className="mt-2 text-sm text-slate-600">Loading session...</p>
      ) : null}
      {isReady && !auth ? (
        <p className="mt-2 text-sm text-amber-700">Please login first.</p>
      ) : null}
      {isReady && auth && !canCreate ? (
        <p className="mt-2 text-sm text-rose-700">
          Current role {auth.user.role} is forbidden to create jobs.
        </p>
      ) : null}

      <form
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
        onSubmit={onSubmit}
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Basic Information
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Required
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Job title
                </span>
                <input
                  name="title"
                  placeholder="e.g. Senior Product Manager"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  disabled={!canCreate || isSubmitting}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Company name
                </span>
                <input
                  name="companyName"
                  placeholder="e.g. NexaSoft"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  disabled={!canCreate || isSubmitting}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Location
                </span>
                <input
                  name="location"
                  placeholder="e.g. Ha Noi"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  disabled={!canCreate || isSubmitting}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Job type
                </span>
                <select
                  name="type"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  disabled={!canCreate || isSubmitting}
                >
                  <option value="FULL_TIME">Full time</option>
                  <option value="PART_TIME">Part time</option>
                  <option value="INTERN">Intern</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Role Details
            </h2>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-semibold text-slate-600">
                Description
              </span>
              <textarea
                name="description"
                placeholder="Summarize responsibilities, scope, and goals. Use bullet points for clarity."
                className="h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-200 focus:ring"
                required
                disabled={!canCreate || isSubmitting}
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-semibold text-slate-600">
                Requirements
              </span>
              <textarea
                name="requirements"
                placeholder="List must-have skills, experience, and qualifications."
                className="h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-200 focus:ring"
                required
                disabled={!canCreate || isSubmitting}
              />
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canCreate || isSubmitting}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Job"}
            </button>
            <p className="text-xs text-slate-500">
              Tip: Clear titles and bullet points improve candidate match rate.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Posting Checklist
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Use specific titles (role + level).</li>
              <li>List 5-7 responsibilities.</li>
              <li>Highlight must-have skills.</li>
              <li>Mention location or remote policy.</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Quality Score
            </h3>
            <div className="mt-3 rounded-2xl bg-slate-100 p-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Completeness</span>
                <span>Good</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white">
                <div className="h-2 w-3/4 rounded-full bg-brand-500" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Add clear requirements to boost visibility.
            </p>
          </article>
        </aside>
      </form>

      {message ? (
        <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
