"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createCompanyReview,
  deleteCompanyReview,
  fetchCompanyReviews,
  fetchMyCompanyReview,
  updateCompanyReview,
} from "../lib/api";
import { useAuth } from "./auth-provider";
import { CompanyReviewItem, CompanyReviewListResponse } from "../types";

type Props = {
  jobId: number;
  jobTitle: string;
  companyName: string;
};

const EMPTY_REVIEW_FORM = {
  rating: "5",
  comment: "",
};

const EMPTY_REVIEW_DATA: CompanyReviewListResponse = {
  job: {
    jobId: 0,
    title: "",
    companyName: "",
    employerId: 0,
    employerName: "",
  },
  items: [],
  summary: {
    total: 0,
    averageRating: null,
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatAverage(value?: number | null) {
  if (value == null) return "No ratings yet";
  return `${value.toFixed(1)}/5`;
}

export default function CompanyReviewsPanel({
  jobId,
  jobTitle,
  companyName,
}: Props) {
  const { auth, isReady } = useAuth();
  const [reviewData, setReviewData] =
    useState<CompanyReviewListResponse>(EMPTY_REVIEW_DATA);
  const [myReview, setMyReview] = useState<CompanyReviewItem | null>(null);
  const [form, setForm] = useState(EMPTY_REVIEW_FORM);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const canReview = auth?.user.role === "CANDIDATE";

  async function loadData(token?: string) {
    setIsLoading(true);
    setMessage("");
    try {
      const listResponse = await fetchCompanyReviews(jobId, { pageSize: 20 }, token);
      setReviewData(listResponse);

      if (token && canReview) {
        const mineResponse = await fetchMyCompanyReview(token, jobId);
        setMyReview(mineResponse.item);

        if (mineResponse.item) {
          setForm({
            rating: String(mineResponse.item.rating),
            comment: mineResponse.item.comment,
          });
        } else {
          setForm(EMPTY_REVIEW_FORM);
        }
      } else {
        setMyReview(null);
        setForm(EMPTY_REVIEW_FORM);
      }
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load job reviews";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isReady) return;
    loadData(auth?.token);
  }, [auth?.token, auth?.user.role, isReady, jobId]);

  const sortedItems = useMemo(() => reviewData.items, [reviewData.items]);

  async function onSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) {
      setMessage("Please login as candidate to review this job.");
      return;
    }

    if (!canReview) {
      setMessage("Only candidate role can submit job reviews.");
      return;
    }

    const rating = Number(form.rating);
    const comment = form.comment.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage("Rating must be an integer between 1 and 5.");
      return;
    }

    if (comment.length < 10) {
      setMessage("Comment must have at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      if (myReview) {
        await updateCompanyReview(auth.token, myReview.id, {
          rating,
          comment,
        });
        setMessage("Review updated.");
      } else {
        await createCompanyReview(auth.token, jobId, {
          rating,
          comment,
        });
        setMessage("Review submitted.");
      }

      await loadData(auth.token);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot save review";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDeleteReview() {
    if (!auth?.token || !myReview) return;

    const confirmed = window.confirm("Delete your review for this job?");
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage("");
    try {
      await deleteCompanyReview(auth.token, myReview.id);
      await loadData(auth.token);
      setMessage("Review deleted.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot delete review";
      setMessage(nextMessage);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="rounded-3xl bg-white p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-900">Job Reviews</h2>
        <button
          type="button"
          onClick={() => loadData(auth?.token)}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <p className="mt-1 text-sm text-slate-600">
        {jobTitle} at {companyName} • {reviewData.summary.total} review(s) • Average: {formatAverage(reviewData.summary.averageRating)}
      </p>

      {canReview ? (
        <form className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4" onSubmit={onSubmitReview}>
          <p className="text-sm font-semibold text-slate-900">
            {myReview ? "Update your review" : "Write a review"}
          </p>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <select
              value={form.rating}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, rating: event.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <textarea
              value={form.comment}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, comment: event.target.value }))
              }
              placeholder="Share your review experience..."
              className="h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
            </button>
            {myReview ? (
              <button
                type="button"
                onClick={onDeleteReview}
                disabled={isDeleting}
                className="rounded-lg border border-rose-300 px-4 py-2 text-sm text-rose-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Review"}
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
          Login as candidate to submit a job review.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {sortedItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No reviews yet for this job.
          </p>
        ) : null}

        {sortedItems.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{item.candidate?.fullName || "Candidate"}</p>
              <p className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                {item.rating}/5
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{item.comment}</p>
            <p className="mt-2 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
          </article>
        ))}
      </div>

      {message ? (
        <p className="mt-3 text-sm text-slate-700">{message}</p>
      ) : null}
    </article>
  );
}
