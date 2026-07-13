"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createJob, getEmployerProfile } from "../../../../lib/api";
import { useAuth } from "../../../../components/auth-provider";

export default function NewJobPage() {
  const { auth, isReady } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileCompanyName, setProfileCompanyName] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

  const currentRole = auth?.user.role;
  const canCreate = currentRole === "EMPLOYER" || currentRole === "ADMIN";

  useEffect(() => {
    async function loadProfile() {
      if (auth?.token && currentRole === "EMPLOYER") {
        try {
          const profile = await getEmployerProfile(auth.token);
          setProfileCompanyName(profile.item.companyName);
          setCredits(profile.item.credits ?? 0);
        } catch {
          // ignore
        }
      }
    }
    loadProfile();
  }, [auth?.token, currentRole]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !canCreate) {
      setMessage("Please login with EMPLOYER or ADMIN account.");
      return;
    }

    if (currentRole === "EMPLOYER" && credits !== null && credits < 1) {
      setMessage("Insufficient credits to post a job. Please buy a package first.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const salaryMinVal = formData.get("salaryMin") ? Number(formData.get("salaryMin")) : undefined;
    const salaryMaxVal = formData.get("salaryMax") ? Number(formData.get("salaryMax")) : undefined;

    const payload = {
      title: String(formData.get("title") || "").trim(),
      companyName: currentRole === "EMPLOYER" ? profileCompanyName : String(formData.get("companyName") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      type: String(formData.get("type") || "FULL_TIME"),
      salaryMin: salaryMinVal,
      salaryMax: salaryMaxVal,
      description: String(formData.get("description") || "").trim(),
      requirements: String(formData.get("requirements") || "").trim(),
    };

    try {
      await createJob(auth.token, payload);
      setMessage("Create job success.");
      // Decrement credits in local state
      if (credits !== null) {
        setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));
      }
      event.currentTarget.reset();
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Create job failed";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasInsufficientCredits = currentRole === "EMPLOYER" && credits !== null && credits < 1;
  const isButtonDisabled = !canCreate || isSubmitting || hasInsufficientCredits;

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
          {credits !== null ? (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
              Credits: {credits}
            </span>
          ) : null}
          <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Role allowed: EMPLOYER or ADMIN
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

      {/* Insufficient Credits Alert Banner */}
      {isReady && currentRole === "EMPLOYER" && credits !== null && credits < 1 ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Insufficient credits! You have 0 credits left. You need at least 1 credit to publish a job.</span>
          </div>
          <Link
            href="/employer/billing"
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 shadow-sm"
          >
            Buy Credits
          </Link>
        </div>
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
                  disabled={!canCreate || isSubmitting || hasInsufficientCredits}
                />
              </label>
              {currentRole === "EMPLOYER" ? (
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Company name
                  </span>
                  <input
                    name="companyName"
                    value={profileCompanyName}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    readOnly
                    required
                  />
                </label>
              ) : (
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
              )}
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Location
                </span>
                <input
                  name="location"
                  placeholder="e.g. Ha Noi"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  disabled={!canCreate || isSubmitting || hasInsufficientCredits}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Job type
                </span>
                <select
                  name="type"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  disabled={!canCreate || isSubmitting || hasInsufficientCredits}
                >
                  <option value="FULL_TIME">Full time</option>
                  <option value="PART_TIME">Part time</option>
                  <option value="INTERN">Intern</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Minimum Salary
                </span>
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="e.g. 15"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  disabled={!canCreate || isSubmitting || hasInsufficientCredits}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Maximum Salary
                </span>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="e.g. 35"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  disabled={!canCreate || isSubmitting || hasInsufficientCredits}
                />
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
                disabled={!canCreate || isSubmitting || hasInsufficientCredits}
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
                disabled={!canCreate || isSubmitting || hasInsufficientCredits}
              />
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isButtonDisabled}
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
