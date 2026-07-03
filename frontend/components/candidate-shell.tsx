"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "./auth-provider";

export default function CandidateShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const { auth, isReady } = useAuth();
  if (!isReady) return <div className="rounded-3xl bg-white p-8 shadow">Loading your session...</div>;
  if (!auth) return <div className="rounded-3xl bg-white p-8 shadow">Please <Link className="font-bold text-blue-600" href="/login">log in</Link> with a candidate account to continue.</div>;
  if (auth.user.role !== "CANDIDATE") return <div className="rounded-3xl bg-white p-8 shadow">The {auth.user.role} role cannot access the candidate workspace.</div>;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-7 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">Candidate Workspace</p>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-slate-200">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
