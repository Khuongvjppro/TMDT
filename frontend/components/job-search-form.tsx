"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

export default function JobSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const q = String(formData.get("q") || "");
    const location = String(formData.get("location") || "");
    const type = String(formData.get("type") || "");

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (type) params.set("type", type);

    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur md:grid-cols-4">
      <input
        name="q"
        defaultValue={searchParams.get("q") || ""}
        placeholder="Keyword (Node.js, Next.js...)"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
      />
      <input
        name="location"
        defaultValue={searchParams.get("location") || ""}
        placeholder="Location"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
      />
      <select
        name="type"
        defaultValue={searchParams.get("type") || ""}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring"
      >
        <option value="">All Types</option>
        <option value="FULL_TIME">Full time</option>
        <option value="PART_TIME">Part time</option>
        <option value="INTERN">Intern</option>
        <option value="FREELANCE">Freelance</option>
        <option value="REMOTE">Remote</option>
      </select>
      <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
        Search Jobs
      </button>
    </form>
  );
}
