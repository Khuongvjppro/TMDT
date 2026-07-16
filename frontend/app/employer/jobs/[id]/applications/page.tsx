"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteEmployerInterviewSchedule,
  listEmployerJobApplications,
  upsertEmployerInterviewSchedule,
  updateEmployerApplicationStatus,
} from "../../../../../lib/api";
import { useAuth } from "../../../../../components/auth-provider";
import {
  ApplicationStatus,
  EmployerJobApplication,
  InterviewMode,
} from "../../../../../types";

type Props = {
  params: Promise<{ id: string }>;
};

type InterviewFormState = {
  mode: InterviewMode;
  startsAt: string;
  endsAt: string;
  meetingLink: string;
  location: string;
  note: string;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "ACCEPTED",
  "REJECTED",
];

const INTERVIEW_MODE_OPTIONS: InterviewMode[] = ["ONLINE", "ONSITE", "PHONE"];

function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toInterviewForm(item: EmployerJobApplication): InterviewFormState {
  return {
    mode: item.interviewSchedule?.mode || "ONLINE",
    startsAt: toInputDateTime(item.interviewSchedule?.startsAt),
    endsAt: toInputDateTime(item.interviewSchedule?.endsAt),
    meetingLink: item.interviewSchedule?.meetingLink || "",
    location: item.interviewSchedule?.location || "",
    note: item.interviewSchedule?.note || "",
  };
}

function emptyInterviewForm(): InterviewFormState {
  return {
    mode: "ONLINE",
    startsAt: "",
    endsAt: "",
    meetingLink: "",
    location: "",
    note: "",
  };
}

export default function EmployerJobApplicationsPage({ params }: Props) {
  const { auth, isReady } = useAuth();
  const [jobId, setJobId] = useState<number | null>(null);
  const [items, setItems] = useState<EmployerJobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [interviewUpdatingId, setInterviewUpdatingId] = useState<number | null>(
    null,
  );
  const [interviewForms, setInterviewForms] = useState<
    Record<number, InterviewFormState>
  >({});

  const canAccess = auth?.user.role === "EMPLOYER";

  function updateInterviewField(
    applicationId: number,
    field: keyof InterviewFormState,
    value: string,
  ) {
    setInterviewForms((prev) => ({
      ...prev,
      [applicationId]: {
        ...(prev[applicationId] || emptyInterviewForm()),
        [field]: value,
      },
    }));
  }

  async function loadData(nextJobId: number) {
    if (!auth?.token || !canAccess) return;
    setIsLoading(true);
    setMessage("");
    try {
      const data = await listEmployerJobApplications(auth.token, nextJobId);
      setItems(data.items);
      const mappedForms: Record<number, InterviewFormState> = {};

      data.items.forEach((item) => {
        mappedForms[item.id] = toInterviewForm(item);
      });

      setInterviewForms(mappedForms);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load applications";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSaveInterview(applicationId: number) {
    if (!auth?.token) return;

    const form = interviewForms[applicationId];
    if (!form?.startsAt) {
      setMessage("Please select interview time.");
      return;
    }

    const startsDate = new Date(form.startsAt);
    const endsDate = new Date(startsDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    setInterviewUpdatingId(applicationId);
    setMessage("");
    try {
      const data = await upsertEmployerInterviewSchedule(
        auth.token,
        applicationId,
        {
          mode: form.mode,
          startsAt: startsDate.toISOString(),
          endsAt: endsDate.toISOString(),
          meetingLink: form.mode === "ONLINE" ? form.meetingLink : "",
          location: form.mode === "ONSITE" ? form.location : "",
          note: form.note,
        },
      );

      setItems((prev) =>
        prev.map((item) =>
          item.id === applicationId
            ? {
                ...item,
                interviewSchedule: data.item,
              }
            : item,
        ),
      );
      setMessage(`Interview schedule saved for application #${applicationId}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "Save interview schedule failed";
      setMessage(nextMessage);
    } finally {
      setInterviewUpdatingId(null);
    }
  }

  async function onDeleteInterview(applicationId: number) {
    if (!auth?.token) return;

    setInterviewUpdatingId(applicationId);
    setMessage("");
    try {
      await deleteEmployerInterviewSchedule(auth.token, applicationId);
      setItems((prev) =>
        prev.map((item) =>
          item.id === applicationId
            ? {
                ...item,
                interviewSchedule: null,
              }
            : item,
        ),
      );
      setMessage(
        `Interview schedule deleted for application #${applicationId}`,
      );
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "Delete interview schedule failed";
      setMessage(nextMessage);
    } finally {
      setInterviewUpdatingId(null);
    }
  }

  useEffect(() => {
    async function init() {
      const resolved = await params;
      const id = Number(resolved.id);
      setJobId(id);
      if (!Number.isFinite(id)) {
        setMessage("Invalid job id");
        return;
      }
      await loadData(id);
    }

    init();
  }, [params, auth?.token, canAccess]);

  async function onChangeStatus(
    applicationId: number,
    status: ApplicationStatus,
  ) {
    if (!auth?.token) return;
    setUpdatingId(applicationId);
    setMessage("");
    try {
      const data = await updateEmployerApplicationStatus(
        auth.token,
        applicationId,
        status,
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === applicationId
            ? { ...item, status: data.item.status }
            : item,
        ),
      );
      setMessage(`Updated application #${applicationId} to ${status}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update status failed";
      setMessage(nextMessage);
    } finally {
      setUpdatingId(null);
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
        Please login as EMPLOYER to view applications.
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
    <section className="relative overflow-hidden rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur space-y-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-slate-100 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-300 to-transparent" />

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Recruitment Funnel
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Job Applications
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Review applicant profiles, manage pipeline statuses, and schedule structured interview dates.
          </p>
          {jobId ? (
            <p className="mt-2 text-xs font-bold text-slate-400">Job ID: #{jobId}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/employer/jobs"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
          >
            ← Back to Jobs
          </Link>
          <button
            type="button"
            onClick={() => (jobId ? loadData(jobId) : undefined)}
            disabled={isLoading || !jobId}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-sm"
          >
            {isLoading ? "Refreshing..." : "Refresh List"}
          </button>
        </div>
      </header>

      {message ? (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-w-sm pointer-events-auto">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">ℹ</span>
            <p className="text-sm font-semibold text-slate-700">{message}</p>
            <button type="button" onClick={() => setMessage("")} className="text-slate-400 hover:text-slate-800 ml-2 font-bold">✕</button>
          </div>
        ) : null}

      <div className="space-y-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Application #{item.id}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {item.candidate.fullName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{item.candidate.email}</p>
                {item.candidate.candidateProfile?.phone ? (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phone: <span className="font-semibold text-slate-700">{item.candidate.candidateProfile.phone}</span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Pipeline Status:</span>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none ring-brand-200 focus:ring"
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(event) =>
                      onChangeStatus(
                        item.id,
                        event.target.value as ApplicationStatus,
                      )
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                {item.cvLink || item.candidate.candidateProfile?.cvLink ? (
                  <a
                    href={
                      item.cvLink ||
                      item.candidate.candidateProfile?.cvLink ||
                      "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View CV ↗
                  </a>
                ) : null}
              </div>
            </div>

            {/* Cover letter Section */}
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cover Letter</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.coverLetter || "No cover letter provided."}
              </p>
            </div>

            {/* Interview scheduling card section */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Interview Coordination
              </h3>

              {item.interviewSchedule ? (
                <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-emerald-800 space-y-1">
                  <p>
                    <strong>📅 Scheduled Time:</strong>{" "}
                    {new Date(item.interviewSchedule.startsAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>⚡ Mode:</strong> {item.interviewSchedule.mode}
                  </p>
                  {item.interviewSchedule.mode === "ONLINE" && item.interviewSchedule.meetingLink && (
                    <p>
                      <strong>🔗 Meeting URL:</strong>{" "}
                      <a href={item.interviewSchedule.meetingLink} target="_blank" rel="noreferrer" className="underline hover:text-emerald-900 break-all">
                        {item.interviewSchedule.meetingLink}
                      </a>
                    </p>
                  )}
                  {item.interviewSchedule.mode === "ONSITE" && item.interviewSchedule.location && (
                    <p>
                      <strong>📍 Location:</strong> {item.interviewSchedule.location}
                    </p>
                  )}
                  {item.interviewSchedule.note ? (
                    <p>
                      <strong>📝 Recruiter Note:</strong> {item.interviewSchedule.note}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No interview details scheduled for this applicant yet.
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interview Mode</span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-brand-200 focus:ring"
                    value={interviewForms[item.id]?.mode || "ONLINE"}
                    onChange={(event) =>
                      updateInterviewField(item.id, "mode", event.target.value)
                    }
                  >
                    {INTERVIEW_MODE_OPTIONS.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interview Time</span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-brand-200 focus:ring"
                    value={interviewForms[item.id]?.startsAt || ""}
                    onChange={(event) =>
                      updateInterviewField(
                        item.id,
                        "startsAt",
                        event.target.value,
                      )
                    }
                  />
                </label>

                {interviewForms[item.id]?.mode === "ONLINE" && (
                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Meeting Link</span>
                    <input
                      placeholder="e.g. https://meet.google.com/xyz-pdqr-abc"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none ring-brand-200 focus:ring"
                      value={interviewForms[item.id]?.meetingLink || ""}
                      onChange={(event) =>
                        updateInterviewField(
                          item.id,
                          "meetingLink",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                )}

                {interviewForms[item.id]?.mode === "ONSITE" && (
                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location Address</span>
                    <input
                      placeholder="e.g. Floor 12, EcoCommerce Tower, HCMC"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none ring-brand-200 focus:ring"
                      value={interviewForms[item.id]?.location || ""}
                      onChange={(event) =>
                        updateInterviewField(
                          item.id,
                          "location",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                )}
              </div>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interview Note</span>
                <textarea
                  placeholder="Provide interview instructions (e.g. bring ID card, preparation topics)..."
                  className="h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none ring-brand-200 focus:ring resize-none"
                  value={interviewForms[item.id]?.note || ""}
                  onChange={(event) =>
                    updateInterviewField(item.id, "note", event.target.value)
                  }
                />
              </label>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onSaveInterview(item.id)}
                  disabled={interviewUpdatingId === item.id}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition shadow-sm"
                >
                  {interviewUpdatingId === item.id
                    ? "Saving Details..."
                    : "Save Schedule"}
                </button>
                {item.interviewSchedule ? (
                  <button
                    type="button"
                    onClick={() => onDeleteInterview(item.id)}
                    disabled={interviewUpdatingId === item.id}
                    className="rounded-full border border-rose-200 px-5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60 transition"
                  >
                    Delete Interview
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-10">
          No applications for this job yet.
        </p>
      ) : null}
    </section>
  );
}
