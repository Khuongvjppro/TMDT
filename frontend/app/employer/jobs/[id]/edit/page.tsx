"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJobDetail, updateJob } from "../../../../../lib/api";
import { useAuth } from "../../../../../components/auth-provider";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EmployerEditJobPage({ params }: Props) {
  const { auth, isReady } = useAuth();
  const router = useRouter();
  const [jobId, setJobId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
  });

  const canAccess = auth?.user.role === "EMPLOYER";

  useEffect(() => {
    async function loadParamsAndJob() {
      const resolved = await params;
      const id = Number(resolved.id);
      setJobId(id);

      if (!Number.isFinite(id)) {
        setMessage("Invalid job id");
        return;
      }

      setIsLoading(true);
      try {
        const job = await fetchJobDetail(id);
        setForm({
          title: job.title,
          companyName: job.companyName,
          location: job.location,
          type: job.type,
          salaryMin: job.salaryMin !== null && job.salaryMin !== undefined ? String(job.salaryMin) : "",
          salaryMax: job.salaryMax !== null && job.salaryMax !== undefined ? String(job.salaryMax) : "",
          description: job.description,
          requirements: job.requirements,
        });
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Cannot load job";
        setMessage(nextMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadParamsAndJob();
  }, [params]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !canAccess || !jobId) {
      setMessage("Please login as EMPLOYER.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const payload = {
      title: form.title,
      companyName: form.companyName,
      location: form.location,
      type: form.type,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      description: form.description,
      requirements: form.requirements,
    };

    try {
      await updateJob(auth.token, jobId, payload);
      setMessage("Update job success.");
      router.push("/employer/jobs");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update job failed";
      setMessage(nextMessage);
    } finally {
      setIsSaving(false);
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
        Please login as EMPLOYER to edit jobs.
      </p>
    );
  }

  if (!canAccess) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}.
      </p>
    );
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
            Edit Job Listing
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update job details and requirements for Job #{jobId}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/employer/jobs"
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Loading listing details...</p>
        </div>
      ) : (
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
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="e.g. Senior Product Manager"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                    required
                    disabled={isSaving}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Company name
                  </span>
                  <input
                    name="companyName"
                    value={form.companyName}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    readOnly
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Location
                  </span>
                  <input
                    name="location"
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                    placeholder="e.g. Ha Noi"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                    required
                    disabled={isSaving}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Job type
                  </span>
                  <select
                    name="type"
                    value={form.type}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, type: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                    disabled={isSaving}
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
                    value={form.salaryMin}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, salaryMin: event.target.value }))
                    }
                    placeholder="e.g. 15"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                    disabled={isSaving}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Maximum Salary
                  </span>
                  <input
                    type="number"
                    name="salaryMax"
                    value={form.salaryMax}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, salaryMax: event.target.value }))
                    }
                    placeholder="e.g. 35"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                    disabled={isSaving}
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
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Summarize responsibilities, scope, and goals. Use bullet points for clarity."
                  className="h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  disabled={isSaving}
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Requirements
                </span>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, requirements: event.target.value }))
                  }
                  placeholder="List must-have skills, experience, and qualifications."
                  className="h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  disabled={isSaving}
                />
              </label>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Job Changes"}
              </button>
              <p className="text-xs text-slate-500">
                Tip: Updating details will reflect instantly to all active applicants.
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
      )}

      {message ? (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-w-sm pointer-events-auto">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">ℹ</span>
            <p className="text-sm font-semibold text-slate-700">{message}</p>
            <button type="button" onClick={() => setMessage("")} className="text-slate-400 hover:text-slate-800 ml-2 font-bold">✕</button>
          </div>
        ) : null}
    </section>
  );
}
