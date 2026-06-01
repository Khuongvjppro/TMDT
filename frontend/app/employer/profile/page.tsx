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
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as EMPLOYER to manage company profile.
      </p>
    );
  }

  if (!canAccess) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}.
      </p>
    );
  }

  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-slate-100 blur-3xl" />

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Employer Workspace
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Company Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep company details consistent across your job listings and
            employer branding.
          </p>
        </div>
        <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          EMPLOYER only
        </span>
      </header>

      {isLoading ? (
        <p className="mt-3 text-sm text-slate-600">Loading profile...</p>
      ) : null}

      <form
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
        onSubmit={onSubmit}
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Company Information
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Company name
                </span>
                <input
                  name="companyName"
                  placeholder="Company Name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  required
                  value={form.companyName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      companyName: event.target.value,
                    }))
                  }
                  disabled={isLoading || isSaving}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">
                  Company website
                </span>
                <input
                  name="companyWebsite"
                  placeholder="https://yourcompany.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  value={form.companyWebsite}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      companyWebsite: event.target.value,
                    }))
                  }
                  disabled={isLoading || isSaving}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-semibold text-slate-600">
                  Company location
                </span>
                <input
                  name="companyLocation"
                  placeholder="Company Location"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring"
                  value={form.companyLocation}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      companyLocation: event.target.value,
                    }))
                  }
                  disabled={isLoading || isSaving}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              About the Company
            </h2>
            <label className="mt-4 block space-y-2">
              <span className="text-xs font-semibold text-slate-600">
                Company description
              </span>
              <textarea
                name="description"
                placeholder="Describe your mission, culture, and what makes you unique."
                className="h-44 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-200 focus:ring"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                disabled={isLoading || isSaving}
              />
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <p className="text-xs text-slate-500">
              Tip: A clear profile improves trust and application rate.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Profile Checklist
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Use consistent branding name.</li>
              <li>Add a website for credibility.</li>
              <li>Provide clear location info.</li>
              <li>Highlight culture and mission.</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Visibility Tip
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Profiles with detailed descriptions are featured more often in
              search results.
            </p>
          </article>
        </aside>
      </form>

      {message ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}
    </section>
  );
}
