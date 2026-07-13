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
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 p-2 bg-white rounded-2xl shadow-md border border-slate-100 md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      {/* Keyword Input */}
      <div className="relative flex items-center">
        <input
          name="q"
          defaultValue={searchParams.get("q") || ""}
          placeholder="Job title, keyword, tech..."
          className="w-full rounded-xl border border-transparent bg-slate-50 py-3 px-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white"
        />
      </div>

      {/* Location Input */}
      <div className="relative flex items-center">
        <input
          name="location"
          defaultValue={searchParams.get("location") || ""}
          placeholder="Location or Remote..."
          className="w-full rounded-xl border border-transparent bg-slate-50 py-3 px-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white"
        />
      </div>

      {/* Job Type Dropdown */}
      <div className="relative flex items-center">
        <select
          name="type"
          defaultValue={searchParams.get("type") || ""}
          className="w-full rounded-xl border border-transparent bg-slate-50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none appearance-none cursor-pointer transition-all focus:border-brand-500 focus:bg-white"
        >
          <option value="">All Job Types</option>
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="INTERN">Intern</option>
          <option value="FREELANCE">Freelance</option>
          <option value="REMOTE">Remote</option>
        </select>
        <span className="absolute right-4 pointer-events-none text-[10px] text-slate-400">
          ▼
        </span>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:bg-brand-600 hover:shadow-brand-500/20 hover:-translate-y-0.5"
      >
        Search Jobs
      </button>
    </form>
  );
}
