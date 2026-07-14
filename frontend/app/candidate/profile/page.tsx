"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import CvUploadManager from "../../../components/cv-upload-manager";
import {
  getCandidateProfile,
  updateCandidateProfile,
} from "../../../lib/api";

export default function CandidateProfilePage() {
  const { auth } = useAuth();

  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [address, setAddress] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load profile from API
  useEffect(() => {
    if (!auth?.token) {
      setLoadingProfile(false);
      return;
    }
    getCandidateProfile(auth.token)
      .then(({ item }) => {
        const p = item.candidateProfile;
        if (p) {
          setPhone(p.phone || "");
          setBio(p.bio || "");
          setJobTitle(p.jobTitle || "");
          setAddress(p.address || "");
          setSkills(p.skills || "");
          setExperienceYears(p.experienceYears || 0);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
      })
      .finally(() => setLoadingProfile(false));
  }, [auth?.token]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!auth?.token) return;
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await updateCandidateProfile(auth.token, {
        fullName: auth.user.fullName,
        phone: phone || undefined,
        bio: bio || undefined,
        jobTitle: jobTitle || undefined,
        address: address || undefined,
        skills: skills || undefined,
        experienceYears,
      });
      setSuccessMsg("Your profile has been updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (!auth) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-sm font-bold text-slate-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <section className="space-y-8 max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Profile</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Manage your personal details, biography, and professional resumes.
        </p>
      </div>

      <hr className="border-slate-200" />

      {/* Messages */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
          <button onClick={() => setSuccessMsg("")} className="ml-auto text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-800 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
          <button onClick={() => setErrorMsg("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-5 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Account Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              readOnly
              value={auth.user.fullName}
              className="mt-1.5 w-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              readOnly
              value={auth.user.email}
              className="mt-1.5 w-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Professional Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Years of Experience</label>
            <input
              type="number"
              min={0}
              max={60}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
          <input
            type="text"
            placeholder="e.g. Ho Chi Minh City, Vietnam"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
          <input
            type="text"
            placeholder="e.g. +84 901 234 567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</label>
          <textarea
            rows={3}
            placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Biography</label>
          <textarea
            rows={4}
            placeholder="Tell employers about your professional background, skills, and goals..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={saving || loadingProfile}
          className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Profile Details"}
        </button>
      </form>

      {/* CV Upload Manager */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <CvUploadManager />
      </div>
    </section>
  );
}
