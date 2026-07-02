import React from "react";
import { ModerationJob } from "../../types/admin.types";
import { JobStatusBadge } from "./JobStatusBadge";

interface JobQueueTableProps {
  jobs: ModerationJob[];
  isLoading: boolean;
  selectedJobId: number | null;
  onSelectJob: (job: ModerationJob) => void;
  onApprove: (job: ModerationJob) => void;
  onReject: (job: ModerationJob) => void;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-4 py-4">
        <div className="h-4 w-48 rounded bg-slate-200" />
      </td>
      <td className="hidden px-4 py-4 md:table-cell">
        <div className="h-4 w-32 rounded bg-slate-200" />
      </td>
      <td className="hidden px-4 py-4 lg:table-cell">
        <div className="h-4 w-24 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded-full bg-slate-200" />
          <div className="h-8 w-16 rounded-full bg-slate-200" />
        </div>
      </td>
    </tr>
  );
}

export function JobQueueTable({
  jobs,
  isLoading,
  selectedJobId,
  onSelectJob,
  onApprove,
  onReject,
}: JobQueueTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Job</th>
              <th className="hidden px-4 py-3 md:table-cell">Employer</th>
              <th className="hidden px-4 py-3 lg:table-cell">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="text-4xl text-slate-300">📋</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          No jobs in queue
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Try adjusting your search or status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Job</th>
            <th className="hidden px-4 py-3 md:table-cell">Employer</th>
            <th className="hidden px-4 py-3 lg:table-cell">Submitted</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const isSelected = selectedJobId === job.id;
            const canModerate = job.status === "PENDING";

            return (
              <tr
                key={job.id}
                className={`border-b border-slate-100 transition hover:bg-slate-50 ${
                  isSelected ? "bg-blue-50/60" : ""
                }`}
              >
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="text-left"
                  >
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">
                      {job.companyName} · {job.location}
                    </p>
                  </button>
                </td>
                <td className="hidden px-4 py-4 md:table-cell">
                  <p className="text-sm text-slate-800">{job.employer.fullName}</p>
                  <p className="text-xs text-slate-500">{job.employer.email}</p>
                </td>
                <td className="hidden px-4 py-4 text-sm text-slate-600 lg:table-cell">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <JobStatusBadge status={job.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Preview
                    </button>
                    {canModerate && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(job)}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(job)}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
