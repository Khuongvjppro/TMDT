import React from "react";
import { JobModerationStatus } from "../../types/admin.types";

const STATUS_STYLES: Record<JobModerationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
};

const STATUS_LABELS: Record<JobModerationStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function JobStatusBadge({ status }: { status: JobModerationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
