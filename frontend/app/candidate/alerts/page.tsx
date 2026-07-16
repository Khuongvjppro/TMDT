"use client";

import { FormEvent, useEffect, useState } from "react";
import CandidateShell from "../../../components/candidate-shell";
import { useAuth } from "../../../components/auth-provider";
import { createJobAlert, deleteJobAlert, listJobAlerts, runJobAlert, updateJobAlert } from "../../../lib/api";
import { JobAlert, JobType } from "../../../types";

export default function AlertsPage() {
  const { auth } = useAuth(); const [items, setItems] = useState<JobAlert[]>([]); const [message, setMessage] = useState("");
  async function load() { if (!auth?.token || auth.user.role !== "CANDIDATE") return; try { setItems((await listJobAlerts(auth.token)).items); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to load job alerts"); } }
  useEffect(() => { load(); }, [auth?.token]);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!auth?.token) return; const form = event.currentTarget; const data = new FormData(form); const number = (name: string) => { const value = String(data.get(name) || ""); return value ? Number(value) : undefined; }; try { await createJobAlert(auth.token, { name: String(data.get("name") || ""), keywords: String(data.get("keywords") || "") || undefined, location: String(data.get("location") || "") || undefined, type: (String(data.get("type") || "") || undefined) as JobType | undefined, salaryMin: number("salaryMin"), salaryMax: number("salaryMax"), experienceMax: number("experienceMax"), isActive: true }); form.reset(); setMessage("Job alert created successfully."); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to create the job alert"); } }
  async function toggle(item: JobAlert) { if (!auth?.token) return; await updateJobAlert(auth.token, item.id, { isActive: !item.isActive }); await load(); }
  async function run(item: JobAlert) { if (!auth?.token) return; try { const data = await runJobAlert(auth.token, item.id); setMessage(data.notification); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to run the alert"); } }
  async function remove(id: number) { if (!auth?.token || !window.confirm("Delete this job alert?")) return; await deleteJobAlert(auth.token, id); await load(); }
  return <CandidateShell title="Job Alerts" description="UC09: save search criteria and simulate notifications when matching jobs become available.">
    <form onSubmit={create} className="grid gap-3 rounded-3xl bg-white p-5 shadow-lg md:grid-cols-3"><input required name="name" placeholder="Alert name" className="rounded-xl border p-3"/><input name="keywords" placeholder="Keywords" className="rounded-xl border p-3"/><input name="location" placeholder="Location" className="rounded-xl border p-3"/><select name="type" className="rounded-xl border p-3"><option value="">All job types</option><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="INTERN">Internship</option><option value="FREELANCE">Freelance</option><option value="REMOTE">Remote</option></select><input type="number" min="0" name="salaryMin" placeholder="Minimum salary" className="rounded-xl border p-3"/><input type="number" min="0" name="salaryMax" placeholder="Maximum salary" className="rounded-xl border p-3"/><input type="number" min="0" name="experienceMax" placeholder="Maximum experience" className="rounded-xl border p-3"/><button className="rounded-xl bg-blue-600 p-3 font-bold text-white md:col-span-2">Create Job Alert</button></form>
    <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-3xl bg-white p-5 shadow-lg"><div className="flex justify-between"><h2 className="text-lg font-black">{item.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.isActive ? "Active" : "Paused"}</span></div><p className="mt-2 text-sm text-slate-600">{[item.keywords, item.location, item.type, item.salaryMin ? `From ${item.salaryMin}` : "", item.experienceMax != null ? `≤ ${item.experienceMax} years` : ""].filter(Boolean).join(" · ") || "All jobs"}</p><p className="mt-2 text-xs text-slate-400">Last checked: {item.lastNotifiedAt ? new Date(item.lastNotifiedAt).toLocaleString("en-US") : "Never"}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => run(item)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Check Now</button><button onClick={() => toggle(item)} className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">{item.isActive ? "Pause" : "Activate"}</button><button onClick={() => remove(item.id)} className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">Delete</button></div></article>)}</div>
    {message ? (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-w-sm pointer-events-auto">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">ℹ</span>
            <p className="text-sm font-semibold text-slate-700">{message}</p>
            <button type="button" onClick={() => setMessage("")} className="text-slate-400 hover:text-slate-800 ml-2 font-bold">✕</button>
          </div>
        ) : null}
  </CandidateShell>;
}
