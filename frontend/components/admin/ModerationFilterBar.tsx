import React from "react";
import { JobModerationStatus } from "../../types/admin.types";

interface ModerationFilterBarProps {
  search: string;
  status: JobModerationStatus | "";
  sortOrder: "asc" | "desc";
  onSearchChange: (search: string) => void;
  onStatusChange: (status: JobModerationStatus | "") => void;
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;
  isLoading?: boolean;
}

export function ModerationFilterBar({
  search,
  status,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortOrderChange,
  isLoading = false,
}: ModerationFilterBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Title, company, location..."
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as JobModerationStatus | "")
            }
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Sort by created
          </label>
          <select
            value={sortOrder}
            onChange={(e) =>
              onSortOrderChange(e.target.value as "asc" | "desc")
            }
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
}
