"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteJob, getEmployerProfile, listEmployerJobs, setJobActive, boostJob } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { Job } from "../../../types";
import { formatSalaryRange } from "../../../lib/job-utils";

export default function EmployerJobsPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<Job[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [boostingId, setBoostingId] = useState<number | null>(null);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(0);

  const canAccess = auth?.user.role === "EMPLOYER";
  const totalJobs = items.length;
  const activeJobs = items.filter((job) => job.isActive).length;
  const inactiveJobs = totalJobs - activeJobs;

  async function onBoost(jobId: number, targetLevel: number) {
    if (!auth?.token) return;
    const job = items.find((item) => item.id === jobId);
    if (!job) return;

    if (targetLevel > maxUnlockedLevel) {
      alert(`Tính năng đẩy tin cấp độ này chưa được mở khóa. Bạn cần mua gói dịch vụ tương ứng (hoặc cao hơn) để mở khóa!`);
      return;
    }

    const cost = targetLevel - (job.boostLevel || 0);
    const confirmMsg = `Bạn có chắc chắn muốn dùng ${cost} credit để đẩy ưu tiên tin tuyển dụng này lên cấp độ ${
      targetLevel === 3 ? "Scale (Premium)" : targetLevel === 2 ? "Growth (Priority)" : "Starter (Basic Boost)"
    }?`;

    if (!window.confirm(confirmMsg)) return;

    setBoostingId(jobId);
    setMessage("");
    try {
      const data = await boostJob(auth.token, jobId, targetLevel);
      setItems((prev) =>
        prev.map((item) =>
          item.id === jobId ? { ...item, boostLevel: data.item.boostLevel } : item,
        ),
      );
      setCredits((prev) => (prev !== null ? Math.max(0, prev - cost) : 0));
      setMessage(`Đẩy ưu tiên thành công cho tin tuyển dụng #${jobId}!`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Đẩy ưu tiên thất bại";
      setMessage(nextMessage);
    } finally {
      setBoostingId(null);
    }
  }

  async function loadData() {
    if (!auth?.token || !canAccess) return;
    setIsLoading(true);
    setMessage("");
    try {
      const [jobsData, profileData] = await Promise.all([
        listEmployerJobs(auth.token),
        getEmployerProfile(auth.token),
      ]);
      setItems(jobsData.items);
      setCredits(profileData.item.credits ?? 0);
      setMaxUnlockedLevel(profileData.item.maxUnlockedLevel ?? 0);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load jobs";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [auth?.token, canAccess]);

  async function onDelete(jobId: number) {
    if (!auth?.token) return;
    setDeletingId(jobId);
    setMessage("");
    try {
      await deleteJob(auth.token, jobId);
      setItems((prev) => prev.filter((item) => item.id !== jobId));
      setMessage(`Deleted job #${jobId}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Delete job failed";
      setMessage(nextMessage);
    } finally {
      setDeletingId(null);
    }
  }

  async function onToggleActive(jobId: number, nextStatus: boolean) {
    if (!auth?.token) return;
    setStatusUpdatingId(jobId);
    setMessage("");
    try {
      const data = await setJobActive(auth.token, jobId, nextStatus);
      setItems((prev) =>
        prev.map((item) =>
          item.id === jobId ? { ...item, isActive: data.item.isActive } : item,
        ),
      );
      setMessage(
        nextStatus ? `Re-activated job #${jobId}` : `Hidden job #${jobId}`,
      );
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update job status failed";
      setMessage(nextMessage);
    } finally {
      setStatusUpdatingId(null);
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
        Please login as EMPLOYER to manage jobs.
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
    <section className="relative overflow-hidden rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-slate-100 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-300 to-transparent" />

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Employer Workspace
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">My Jobs</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage listings, keep roles visible, and track applications with a
            clear overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {credits !== null ? (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-bold text-amber-800">
              Credits: {credits}
            </span>
          ) : null}
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-60"
          >
            {isLoading ? "Refreshing..." : "Refresh Jobs"}
          </button>
          <Link
            href="/employer/jobs/new"
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
          >
            Create New Job
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Total Jobs
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalJobs}</p>
          <p className="mt-1 text-xs text-slate-500">All listings</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Active Jobs
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {activeJobs}
          </p>
          <p className="mt-1 text-xs text-slate-500">Visible to candidates</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Inactive Jobs
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {inactiveJobs}
          </p>
          <p className="mt-1 text-xs text-slate-500">Hidden listings</p>
        </article>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((job) => (
          <article
            key={job.id}
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              job.boostLevel === 3
                ? "border-amber-200 bg-amber-50/10 shadow-amber-500/5"
                : job.boostLevel === 2
                  ? "border-indigo-200 bg-indigo-50/10 shadow-indigo-500/5"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1.5 ${
                job.boostLevel === 3
                  ? "bg-gradient-to-b from-amber-500 to-amber-300"
                  : job.boostLevel === 2
                    ? "bg-gradient-to-b from-indigo-500 to-indigo-300"
                    : job.boostLevel === 1
                      ? "bg-gradient-to-b from-slate-400 to-slate-200"
                      : "bg-gradient-to-b from-brand-500 to-brand-200"
              }`}
            />
            <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                    #{job.id}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                    {job.type}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  {job.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {job.companyName} • {job.location}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {job.boostLevel > 0 ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      job.boostLevel === 3
                        ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                        : job.boostLevel === 2
                          ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                          : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {job.boostLevel === 3
                      ? "🚀 SCALE BOOST"
                      : job.boostLevel === 2
                        ? "⚡ GROWTH BOOST"
                        : "✨ STARTER BOOST"}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    job.isActive
                      ? "bg-brand-50 text-brand-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {job.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs pl-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Salary: {formatSalaryRange(job.salaryMin, job.salaryMax)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Location: {job.location}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 pl-2">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/employer/jobs/${job.id}/edit`}
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  Edit
                </Link>
                <Link
                  href={`/employer/jobs/${job.id}/applications`}
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex items-center gap-2">
                    <span>Applications</span>
                    {job.applicationsCount ? (
                      <span className="min-w-[20px] rounded-full bg-slate-900 px-2 py-0.5 text-center text-[10px] font-bold text-white">
                        {job.applicationsCount}
                      </span>
                    ) : null}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => onToggleActive(job.id, !job.isActive)}
                  disabled={statusUpdatingId === job.id}
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-60"
                >
                  {statusUpdatingId === job.id
                    ? "Updating..."
                    : job.isActive
                      ? "Hide"
                      : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(job.id)}
                  disabled={deletingId === job.id}
                  className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {deletingId === job.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {job.isActive && job.boostLevel < 3 ? (
                <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50/50 px-3 py-1">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Đẩy ưu tiên:</span>
                  {job.boostLevel < 1 ? (
                    <button
                      type="button"
                      onClick={() => onBoost(job.id, 1)}
                      disabled={boostingId !== null || maxUnlockedLevel < 1}
                      className="rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-60 shadow-sm"
                    >
                      {maxUnlockedLevel < 1 ? "🔒 Starter (1 Cr)" : "Starter (1 Cr)"}
                    </button>
                  ) : null}
                  {job.boostLevel < 2 ? (
                    <button
                      type="button"
                      onClick={() => onBoost(job.id, 2)}
                      disabled={boostingId !== null || maxUnlockedLevel < 2}
                      className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[11px] font-bold border border-indigo-200 transition disabled:opacity-60 shadow-sm"
                    >
                      {maxUnlockedLevel < 2
                        ? (job.boostLevel === 1 ? "🔒 Up Growth (1 Cr)" : "🔒 Growth (2 Cr)")
                        : (job.boostLevel === 1 ? "Up Growth (1 Cr)" : "Growth (2 Cr)")}
                    </button>
                  ) : null}
                  {job.boostLevel < 3 ? (
                    <button
                      type="button"
                      onClick={() => onBoost(job.id, 3)}
                      disabled={boostingId !== null || maxUnlockedLevel < 3}
                      className="rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-bold border border-amber-200 transition disabled:opacity-60 shadow-sm"
                    >
                      {maxUnlockedLevel < 3
                        ? (job.boostLevel === 2
                          ? "🔒 Up Scale (1 Cr)"
                          : job.boostLevel === 1
                            ? "🔒 Up Scale (2 Cr)"
                            : "🔒 Scale (3 Cr)")
                        : (job.boostLevel === 2
                          ? "Up Scale (1 Cr)"
                          : job.boostLevel === 1
                            ? "Up Scale (2 Cr)"
                            : "Scale (3 Cr)")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No jobs found. Create your first job.
        </p>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}
    </section>
  );
}
