"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CandidateShell from "../../../components/candidate-shell";
import SaveJobButton from "../../../components/save-job-button";
import { useAuth } from "../../../components/auth-provider";
import { createConversation, fetchJobs } from "../../../lib/api";
import { formatSalaryRange } from "../../../lib/job-utils";
import { Job } from "../../../types";

export default function CandidateJobsPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function search(query: Record<string, string> = {}) {
    setLoading(true); setMessage("");
    try { const data = await fetchJobs(query); setItems(data.items); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to find jobs"); }
    finally { setLoading(false); }
  }
  useEffect(() => { search(); }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const query: Record<string, string> = {};
    for (const key of ["q", "location", "type", "salaryMin", "salaryMax", "experienceMax"]) { const value = String(data.get(key) || "").trim(); if (value) query[key] = value; }
    search(query);
  }

  async function chat(employerId: number) {
    if (!auth?.token) return;
    try { const data = await createConversation(auth.token, employerId); router.push(`/candidate/chat?room=${data.item.id}`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to open the conversation"); }
  }

  return <CandidateShell title="Advanced Job Search" description="UC07–UC08–UC10: search by keyword and filter by salary, experience, location, and job type.">
    <form onSubmit={submit} className="grid gap-3 rounded-3xl bg-white p-5 shadow-lg md:grid-cols-3">
      <input name="q" placeholder="Job title or company" className="rounded-xl border p-3" />
      <input name="location" placeholder="Location" className="rounded-xl border p-3" />
      <select name="type" className="rounded-xl border p-3"><option value="">All job types</option><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="INTERN">Internship</option><option value="FREELANCE">Freelance</option><option value="REMOTE">Remote</option></select>
      <input name="salaryMin" type="number" min="0" placeholder="Minimum salary" className="rounded-xl border p-3" />
      <input name="salaryMax" type="number" min="0" placeholder="Maximum salary" className="rounded-xl border p-3" />
      <input name="experienceMax" type="number" min="0" placeholder="Maximum experience (years)" className="rounded-xl border p-3" />
      <button className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white md:col-span-3">{loading ? "Searching..." : "Search Jobs"}</button>
    </form>
    <div className="flex items-center justify-between"><h2 className="text-xl font-black">{items.length} matching jobs</h2></div>
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((job) => <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md">
        <div className="flex justify-between gap-3"><div><h3 className="text-lg font-black">{job.title}</h3><p className="text-sm font-semibold text-blue-700">{job.companyName}</p></div><span className="h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{job.type.replace("_", " ")}</span></div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1">📍 {job.location}</span><span className="rounded-full bg-slate-100 px-3 py-1">💰 {formatSalaryRange(job.salaryMin, job.salaryMax)}</span><span className="rounded-full bg-slate-100 px-3 py-1">💼 {job.experienceYears || 0} years</span></div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
        <div className="mt-4 flex flex-wrap gap-2"><Link href={`/jobs/${job.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">View & Apply</Link><SaveJobButton jobId={job.id} /><button onClick={() => chat(job.employerId)} className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">💬 Chat with Employer</button></div>
      </article>)}
    </div>
    {message ? (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-w-sm pointer-events-auto">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">ℹ</span>
            <p className="text-sm font-semibold text-slate-700">{message}</p>
            <button type="button" onClick={() => setMessage("")} className="text-slate-400 hover:text-slate-800 ml-2 font-bold">✕</button>
          </div>
        ) : null}
  </CandidateShell>;
}
