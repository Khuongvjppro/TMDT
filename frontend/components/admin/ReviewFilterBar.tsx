import React from "react";
import { ReviewFilters } from "../../types/admin.types";

interface ReviewFilterBarProps {
  search: string;
  visibility: ReviewFilters["visibility"];
  minRating: string;
  maxRating: string;
  onSearchChange: (value: string) => void;
  onVisibilityChange: (value: ReviewFilters["visibility"]) => void;
  onMinRatingChange: (value: string) => void;
  onMaxRatingChange: (value: string) => void;
  isLoading?: boolean;
}

export function ReviewFilterBar({
  search,
  visibility,
  minRating,
  maxRating,
  onSearchChange,
  onVisibilityChange,
  onMinRatingChange,
  onMaxRatingChange,
  isLoading = false,
}: ReviewFilterBarProps) {
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
            placeholder="Content, author, job..."
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) =>
              onVisibilityChange(e.target.value as ReviewFilters["visibility"])
            }
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          >
            <option value="all">All reviews</option>
            <option value="visible">Visible only</option>
            <option value="hidden">Hidden only</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Min rating
          </label>
          <select
            value={minRating}
            onChange={(e) => onMinRatingChange(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Max rating
          </label>
          <select
            value={maxRating}
            onChange={(e) => onMaxRatingChange(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
