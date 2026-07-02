import React from "react";
import { AdminReview } from "../../types/admin.types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(rating)}
      <span className="text-slate-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-48 rounded bg-slate-200" /></td>
      <td className="hidden px-4 py-4 md:table-cell"><div className="h-4 w-32 rounded bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-6 w-16 rounded-full bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-8 w-24 rounded-full bg-slate-200" /></td>
    </tr>
  );
}

interface ReviewTableProps {
  reviews: AdminReview[];
  isLoading: boolean;
  onHide: (review: AdminReview) => void;
  onRestore: (review: AdminReview) => void;
  onView: (review: AdminReview) => void;
}

export function ReviewTable({
  reviews,
  isLoading,
  onHide,
  onRestore,
  onView,
}: ReviewTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="hidden px-4 py-3 md:table-cell">Job</th>
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

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="text-4xl text-slate-300">💬</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No reviews found</h3>
        <p className="mt-2 text-sm text-slate-500">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Review</th>
            <th className="hidden px-4 py-3 md:table-cell">Job / Author</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-4">
                <Stars rating={review.rating} />
              </td>
              <td className="max-w-md px-4 py-4">
                <p className="line-clamp-2 text-sm text-slate-800">{review.content}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {review.author.fullName} · {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </td>
              <td className="hidden px-4 py-4 md:table-cell">
                <p className="text-sm font-medium text-slate-800">{review.job.title}</p>
                <p className="text-xs text-slate-500">{review.job.companyName}</p>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    review.isHidden
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  }`}
                >
                  {review.isHidden ? "Hidden" : "Visible"}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onView(review)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </button>
                  {!review.isHidden ? (
                    <button
                      type="button"
                      onClick={() => onHide(review)}
                      className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Hide
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRestore(review)}
                      className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
