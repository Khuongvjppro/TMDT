"use client";

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
    try {
      await updateJob(auth.token, jobId, form);
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
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return <p className="rounded-2xl bg-white p-4 shadow">Please login as EMPLOYER to edit jobs.</p>;
  }

  if (!canAccess) {
    return <p className="rounded-2xl bg-white p-4 shadow">Forbidden for role {auth.user.role}.</p>;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Edit Job</h1>
      <p className="mt-1 text-sm text-slate-600">Employer white feature: update own job.</p>

      {isLoading ? <p className="mt-3 text-sm text-slate-600">Loading job...</p> : null}

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <input
          name="title"
          placeholder="Job title"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          required
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <input
          name="companyName"
          placeholder="Company name"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          required
          value={form.companyName}
          onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <input
          name="location"
          placeholder="Location"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          required
          value={form.location}
          onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <select
          name="type"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          value={form.type}
          onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          disabled={isLoading || isSaving}
        >
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="INTERN">Intern</option>
          <option value="FREELANCE">Freelance</option>
          <option value="REMOTE">Remote</option>
        </select>
        <textarea
          name="description"
          placeholder="Description"
          className="h-32 w-full rounded-xl border px-3 py-2 text-sm"
          required
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <textarea
          name="requirements"
          placeholder="Requirements"
          className="h-32 w-full rounded-xl border px-3 py-2 text-sm"
          required
          value={form.requirements}
          onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <button
          type="submit"
          disabled={isLoading || isSaving}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Job"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
