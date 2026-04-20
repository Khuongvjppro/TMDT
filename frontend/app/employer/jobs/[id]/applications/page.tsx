"use client";

import { useEffect, useState } from "react";
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
    if (!form?.startsAt || !form?.endsAt) {
      setMessage("Please fill interview start/end date-time.");
      return;
    }

    setInterviewUpdatingId(applicationId);
    setMessage("");
    try {
      const data = await upsertEmployerInterviewSchedule(auth.token, applicationId, {
        mode: form.mode,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        meetingLink: form.meetingLink,
        location: form.location,
        note: form.note,
      });

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
        error instanceof Error ? error.message : "Save interview schedule failed";
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
      setMessage(`Interview schedule deleted for application #${applicationId}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Delete interview schedule failed";
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

  async function onChangeStatus(applicationId: number, status: ApplicationStatus) {
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
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return <p className="rounded-2xl bg-white p-4 shadow">Please login as EMPLOYER to view applications.</p>;
  }

  if (!canAccess) {
    return <p className="rounded-2xl bg-white p-4 shadow">Forbidden for role {auth.user.role}.</p>;
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Job Applications</h1>
      <p className="text-sm text-slate-600">
        Employer white feature: view applications and update basic status.
      </p>
      {jobId ? (
        <p className="text-xs font-semibold text-slate-500">Job ID: #{jobId}</p>
      ) : null}

      <button
        type="button"
        onClick={() => (jobId ? loadData(jobId) : undefined)}
        disabled={isLoading || !jobId}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Refreshing..." : "Refresh Applications"}
      </button>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">Application #{item.id}</p>
            <h2 className="mt-1 text-base font-bold text-slate-900">{item.candidate.fullName}</h2>
            <p className="text-sm text-slate-600">{item.candidate.email}</p>
            <p className="text-xs text-slate-500">Phone: {item.candidate.candidateProfile?.phone || "N/A"}</p>
            <p className="mt-2 text-sm text-slate-700">{item.coverLetter || "No cover letter"}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Status</span>
              <select
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                value={item.status}
                disabled={updatingId === item.id}
                onChange={(event) =>
                  onChangeStatus(item.id, event.target.value as ApplicationStatus)
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {item.cvLink || item.candidate.candidateProfile?.cvLink ? (
                <a
                  href={item.cvLink || item.candidate.candidateProfile?.cvLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  Open CV Link
                </a>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-600">Interview Schedule</p>
              {item.interviewSchedule ? (
                <p className="mt-1 text-xs text-emerald-700">
                  Scheduled: {new Date(item.interviewSchedule.startsAt).toLocaleString()} - {" "}
                  {new Date(item.interviewSchedule.endsAt).toLocaleString()}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">No interview schedule yet.</p>
              )}

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <select
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
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

                <input
                  type="datetime-local"
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  value={interviewForms[item.id]?.startsAt || ""}
                  onChange={(event) =>
                    updateInterviewField(item.id, "startsAt", event.target.value)
                  }
                />

                <input
                  type="datetime-local"
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  value={interviewForms[item.id]?.endsAt || ""}
                  onChange={(event) =>
                    updateInterviewField(item.id, "endsAt", event.target.value)
                  }
                />

                <input
                  placeholder="Meeting link"
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  value={interviewForms[item.id]?.meetingLink || ""}
                  onChange={(event) =>
                    updateInterviewField(
                      item.id,
                      "meetingLink",
                      event.target.value,
                    )
                  }
                />

                <input
                  placeholder="Location"
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  value={interviewForms[item.id]?.location || ""}
                  onChange={(event) =>
                    updateInterviewField(item.id, "location", event.target.value)
                  }
                />
              </div>

              <textarea
                placeholder="Interview note"
                className="mt-2 h-20 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
                value={interviewForms[item.id]?.note || ""}
                onChange={(event) =>
                  updateInterviewField(item.id, "note", event.target.value)
                }
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSaveInterview(item.id)}
                  disabled={interviewUpdatingId === item.id}
                  className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {interviewUpdatingId === item.id ? "Saving..." : "Save Interview"}
                </button>
                {item.interviewSchedule ? (
                  <button
                    type="button"
                    onClick={() => onDeleteInterview(item.id)}
                    disabled={interviewUpdatingId === item.id}
                    className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
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
        <p className="text-sm text-slate-600">No applications for this job yet.</p>
      ) : null}

      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </section>
  );
}
