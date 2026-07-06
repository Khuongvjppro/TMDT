"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CandidateShell from "../../../components/candidate-shell";
import { useAuth } from "../../../components/auth-provider";
import { listSavedJobs, unsaveJob } from "../../../lib/api";
import { formatSalaryRange } from "../../../lib/job-utils";
import { SavedJob } from "../../../types";

export default function SavedJobsPage() {
  const { auth } = useAuth(); const [items, setItems] = useState<SavedJob[]>([]); const [message, setMessage] = useState("");
  async function load() { if (!auth?.token || auth.user.role !== "CANDIDATE") return; try { setItems((await listSavedJobs(auth.token)).items); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to load saved jobs"); } }
  useEffect(() => { load(); }, [auth?.token]);
  async function remove(jobId: number) { if (!auth?.token) return; await unsaveJob(auth.token, jobId); setMessage("Job removed from your saved list."); await load(); }
  return <CandidateShell title="Saved Jobs" description="UC12: keep track of and manage the opportunities that interest you.">
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(({ id, job, createdAt }) => <article key={id} className="rounded-3xl bg-white p-5 shadow-lg"><h2 className="text-lg font-black">{job.title}</h2><p className="font-semibold text-blue-700">{job.companyName}</p><p className="mt-2 text-sm text-slate-600">{job.location} · {formatSalaryRange(job.salaryMin, job.salaryMax)}</p><p className="mt-1 text-xs text-slate-400">Saved on {new Date(createdAt).toLocaleString("en-US")}</p><div className="mt-4 flex gap-2"><Link href={`/jobs/${job.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">View & Apply</Link><button onClick={() => remove(job.id)} className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">Remove</button></div></article>)}
    </div>
    {!items.length ? <p className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow">You have not saved any jobs yet.</p> : null}
    {message ? <p className="rounded-2xl bg-white p-4 text-center font-semibold text-blue-700">{message}</p> : null}
  </CandidateShell>;
}
