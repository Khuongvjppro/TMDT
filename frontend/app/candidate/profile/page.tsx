"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";

export default function CandidateProfilePage() {
  const { auth } = useAuth();

  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [cvLink, setCvLink] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("jobfinder_candidate_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        setPhone(parsed.phone || "");
        setBio(parsed.bio || "");
        setCvLink(parsed.cvLink || "");
      }
    } catch (e) {
      console.error(e);
    }
  }, [auth]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    setTimeout(() => {
      try {
        const profile = { phone, bio, cvLink };
        localStorage.setItem("jobfinder_candidate_profile", JSON.stringify(profile));
        setSuccessMsg("Your personal profile has been updated successfully!");
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  if (!auth) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-sm font-bold text-slate-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Profile</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Manage your personal details, biography, and professional resume.
        </p>
      </div>

      <hr className="border-slate-200" />

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
          ✓ {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        {/* Account Details */}
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

        {/* Phone Number */}
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

        {/* Professional Biography */}
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

        {/* CV / Resume Link */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">CV / Resume Link</label>
          <input
            type="url"
            placeholder="e.g. https://drive.google.com/your-cv-link"
            value={cvLink}
            onChange={(e) => setCvLink(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Profile Details"}
        </button>
      </form>
    </section>
  );
}
