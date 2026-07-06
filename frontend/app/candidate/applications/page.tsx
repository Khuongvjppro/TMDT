"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CandidateShell from "../../../components/candidate-shell";
import { useAuth } from "../../../components/auth-provider";
import { listMyApplications, withdrawApplication } from "../../../lib/api";
import { ApplicationStatus, CandidateApplication } from "../../../types";

const statusText: Record<ApplicationStatus, string> = { PENDING: "Pending", REVIEWING: "Under Review", ACCEPTED: "Accepted", REJECTED: "Rejected", WITHDRAWN: "Withdrawn" };
const filters: Array<{ value: "ALL" | ApplicationStatus; label: string }> = [{ value: "ALL", label: "All" }, ...Object.entries(statusText).map(([value, label]) => ({ value: value as ApplicationStatus, label }))];

export default function CandidateApplicationsPage() {
  const { auth } = useAuth(); const [items, setItems] = useState<CandidateApplication[]>([]); const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL"); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function load() { if (!auth?.token || auth.user.role !== "CANDIDATE") return; setLoading(true); try { setItems((await listMyApplications(auth.token)).items); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to load application history"); } finally { setLoading(false); } }
  useEffect(() => { load(); }, [auth?.token]);
  async function withdraw(id: number) { if (!auth?.token || !window.confirm("Withdraw this application?")) return; try { await withdrawApplication(auth.token, id); setMessage("Application withdrawn successfully."); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to withdraw the application"); } }
  const shown = filter === "ALL" ? items : items.filter((item) => item.status === filter);
  return <CandidateShell title="Application History" description="UC13: track every application and withdraw while it is pending or under review.">
    <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === item.value ? "bg-blue-600 text-white" : "bg-white text-slate-600 shadow"}`}>{item.label}</button>)}</div>
    <div className="space-y-3">{shown.map((application) => <article key={application.id} className="rounded-3xl bg-white p-5 shadow-lg"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-slate-400">Application #{application.id}</p><h2 className="text-lg font-black">{application.job.title}</h2><p className="text-sm font-semibold text-blue-700">{application.job.companyName} · {application.job.location}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${application.status === "WITHDRAWN" || application.status === "REJECTED" ? "bg-rose-100 text-rose-700" : application.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{statusText[application.status]}</span></div><p className="mt-3 text-xs text-slate-500">Applied on {new Date(application.createdAt).toLocaleString("en-US")}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/jobs/${application.job.id}`} className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">View Job</Link>{application.cvLink ? <a href={application.cvLink} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold">View Submitted CV</a> : null}{["PENDING", "REVIEWING"].includes(application.status) ? <button onClick={() => withdraw(application.id)} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">Withdraw</button> : null}</div></article>)}</div>
    {!loading && !shown.length ? <p className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow">No applications match this status.</p> : null}
    {message ? <p className="rounded-2xl bg-white p-4 text-center font-semibold text-blue-700">{message}</p> : null}
  </CandidateShell>;
}
