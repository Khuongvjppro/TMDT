"use client";

import { FormEvent, useEffect, useState } from "react";
import CandidateShell from "../../../components/candidate-shell";
import { useAuth } from "../../../components/auth-provider";
import { createCandidateCv, deleteCandidateCv, getCandidateProfile, updateCandidateCv, updateCandidateProfile } from "../../../lib/api";
import { CandidateCv, CandidateProfile } from "../../../types";

export default function CandidateProfilePage() {
  const { auth } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [cvs, setCvs] = useState<CandidateCv[]>([]);
  const [editingCv, setEditingCv] = useState<CandidateCv | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!auth?.token || auth.user.role !== "CANDIDATE") return;
    try {
      const data = await getCandidateProfile(auth.token);
      setProfile(data.item);
      setCvs(data.item.candidateCvs);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load your profile");
    }
  }

  useEffect(() => { load(); }, [auth?.token]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      await updateCandidateProfile(auth.token, {
        fullName: String(data.get("fullName") || ""),
        phone: String(data.get("phone") || ""),
        jobTitle: String(data.get("jobTitle") || ""),
        address: String(data.get("address") || ""),
        skills: String(data.get("skills") || ""),
        bio: String(data.get("bio") || ""),
        experienceYears: Number(data.get("experienceYears") || 0),
      });
      setMessage("Profile updated successfully.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update your profile"); }
    finally { setBusy(false); }
  }

  async function saveCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setMessage("");
    const payload = {
      title: String(data.get("title") || ""),
      fileUrl: String(data.get("fileUrl") || ""),
      summary: String(data.get("summary") || ""),
      isPrimary: data.get("isPrimary") === "on",
    };
    try {
      if (editingCv) await updateCandidateCv(auth.token, editingCv.id, payload);
      else await createCandidateCv(auth.token, payload);
      setMessage(editingCv ? "CV updated successfully." : "CV added successfully.");
      setEditingCv(null); form.reset(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save the CV"); }
    finally { setBusy(false); }
  }

  async function removeCv(id: number) {
    if (!auth?.token || !window.confirm("Delete this CV?")) return;
    await deleteCandidateCv(auth.token, id); setMessage("CV deleted successfully."); await load();
  }

  async function makePrimary(cv: CandidateCv) {
    if (!auth?.token) return;
    await updateCandidateCv(auth.token, cv.id, { isPrimary: true }); setMessage("Default CV updated."); await load();
  }

  const info = profile?.candidateProfile;
  return (
    <CandidateShell title="Profile & CV Management" description="UC05–UC06: maintain your online profile and manage multiple CV versions.">
      <form key={profile?.id ?? "loading"} onSubmit={saveProfile} className="grid gap-4 rounded-3xl bg-white p-6 shadow-lg md:grid-cols-2">
        <h2 className="md:col-span-2 text-xl font-black">Personal Information</h2>
        <Field name="fullName" label="Full name" defaultValue={profile?.fullName} required />
        <Field name="phone" label="Phone number" defaultValue={info?.phone} />
        <Field name="jobTitle" label="Desired position" defaultValue={info?.jobTitle} />
        <Field name="address" label="Address" defaultValue={info?.address} />
        <Field name="experienceYears" label="Years of experience" type="number" defaultValue={String(info?.experienceYears ?? 0)} />
        <label className="space-y-1 md:col-span-2"><span className="text-sm font-bold">Skills</span><textarea name="skills" defaultValue={info?.skills ?? ""} placeholder="React, Node.js, communication..." className="h-24 w-full rounded-xl border p-3" /></label>
        <label className="space-y-1 md:col-span-2"><span className="text-sm font-bold">Professional summary</span><textarea name="bio" defaultValue={info?.bio ?? ""} className="h-28 w-full rounded-xl border p-3" /></label>
        <button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50">Save Profile</button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form key={editingCv?.id ?? "new"} onSubmit={saveCv} className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex justify-between"><h2 className="text-xl font-black">{editingCv ? "Edit CV" : "Add a CV"}</h2>{editingCv ? <button type="button" onClick={() => setEditingCv(null)} className="text-sm text-slate-500">Cancel editing</button> : null}</div>
          <Field name="title" label="CV title" defaultValue={editingCv?.title} required />
          <Field name="fileUrl" label="CV URL" type="url" defaultValue={editingCv?.fileUrl} required />
          <label className="block space-y-1"><span className="text-sm font-bold">Summary</span><textarea name="summary" defaultValue={editingCv?.summary ?? ""} className="h-24 w-full rounded-xl border p-3" /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="isPrimary" type="checkbox" defaultChecked={editingCv?.isPrimary} /> Set as default CV</label>
          <button disabled={busy} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white">{editingCv ? "Save Changes" : "Add CV"}</button>
        </form>
        <div className="space-y-3 rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-black">Your CVs ({cvs.length})</h2>
          {cvs.map((cv) => <article key={cv.id} className="rounded-2xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{cv.title}</h3><p className="mt-1 text-sm text-slate-600">{cv.summary || "No summary provided"}</p></div>{cv.isPrimary ? <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Default</span> : null}</div>
            <div className="mt-4 flex flex-wrap gap-2"><a href={cv.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">View CV</a><button onClick={() => setEditingCv(cv)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Edit CV</button><button onClick={() => removeCv(cv.id)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Delete CV</button>{!cv.isPrimary ? <button onClick={() => makePrimary(cv)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold">Set as Default</button> : null}</div>
          </article>)}
          {!cvs.length ? <p className="text-sm text-slate-500">You have not added a CV yet.</p> : null}
        </div>
      </div>
      {message ? <p className="rounded-2xl bg-white p-4 text-center font-semibold text-blue-700 shadow">{message}</p> : null}
    </CandidateShell>
  );
}

function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string | null; type?: string; required?: boolean }) {
  return <label className="block space-y-1"><span className="text-sm font-bold">{label}</span><input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} min={type === "number" ? 0 : undefined} className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500" /></label>;
}
