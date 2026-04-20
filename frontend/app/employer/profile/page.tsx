"use client";

import { FormEvent, useEffect, useState } from "react";
import { getEmployerProfile, updateEmployerProfile } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";

export default function EmployerProfilePage() {
  const { auth, isReady } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    companyWebsite: "",
    companyLocation: "",
    description: "",
  });

  const canAccess = auth?.user.role === "EMPLOYER";

  useEffect(() => {
    async function loadData() {
      if (!auth?.token || !canAccess) return;
      setIsLoading(true);
      setMessage("");
      try {
        const data = await getEmployerProfile(auth.token);
        setForm({
          companyName: data.item.companyName || "",
          companyWebsite: data.item.companyWebsite || "",
          companyLocation: data.item.companyLocation || "",
          description: data.item.description || "",
        });
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Cannot load profile";
        setMessage(nextMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [auth?.token, canAccess]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !canAccess) {
      setMessage("Please login as EMPLOYER.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      await updateEmployerProfile(auth.token, form);
      setMessage("Update company profile success.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update profile failed";
      setMessage(nextMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return <p className="rounded-2xl bg-white p-4 shadow">Please login as EMPLOYER to manage company profile.</p>;
  }

  if (!canAccess) {
    return <p className="rounded-2xl bg-white p-4 shadow">Forbidden for role {auth.user.role}.</p>;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Company Profile</h1>
      <p className="mt-1 text-sm text-slate-600">Employer white feature: manage company profile.</p>

      {isLoading ? <p className="mt-3 text-sm text-slate-600">Loading profile...</p> : null}

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <input
          name="companyName"
          placeholder="Company Name"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          required
          value={form.companyName}
          onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <input
          name="companyWebsite"
          placeholder="Company Website"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          value={form.companyWebsite}
          onChange={(event) => setForm((prev) => ({ ...prev, companyWebsite: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <input
          name="companyLocation"
          placeholder="Company Location"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          value={form.companyLocation}
          onChange={(event) => setForm((prev) => ({ ...prev, companyLocation: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <textarea
          name="description"
          placeholder="Company Description"
          className="h-40 w-full rounded-xl border px-3 py-2 text-sm"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <button
          type="submit"
          disabled={isLoading || isSaving}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
