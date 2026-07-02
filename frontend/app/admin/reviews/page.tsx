"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminReview } from "../../../types/admin.types";
import { useAuth } from "../../../components/auth-provider";
import { useToast } from "../../../hooks/useToast";
import { useAdminReviews } from "../../../hooks/useAdminReviews";
import { adminApi } from "../../../lib/admin-api";
import { ToastContainer } from "../../../components/admin/ToastContainer";
import { ConfirmationModal } from "../../../components/admin/ConfirmationModal";
import { ReviewFilterBar } from "../../../components/admin/ReviewFilterBar";
import { ReviewTable } from "../../../components/admin/ReviewTable";
import { Pagination } from "../../../components/admin/Pagination";
import { ErrorState } from "../../../components/admin/States";

type ModalAction = "hide" | "restore" | null;

export default function AdminReviewsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();
  const { auth, isReady } = useAuth();

  const {
    data,
    loading,
    error,
    filters,
    fetchReviews,
    handleSearch,
    handleVisibility,
    handleMinRating,
    handleMaxRating,
    handlePageChange,
    handlePageSizeChange,
  } = useAdminReviews(10);

  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    action: ModalAction;
    review: AdminReview | null;
    reason: string;
  }>({ isOpen: false, action: null, review: null, reason: "" });

  useEffect(() => {
    if (!isReady) return;
    if (!auth || auth.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [auth, isReady, router]);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (error) addToast("error", error);
  }, [error, addToast]);

  const openHideModal = (review: AdminReview) => {
    setModal({ isOpen: true, action: "hide", review, reason: "" });
  };

  const openRestoreModal = (review: AdminReview) => {
    setModal({ isOpen: true, action: "restore", review, reason: "" });
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: null, review: null, reason: "" });
  };

  const handleHide = async () => {
    if (!modal.review || modal.reason.trim().length < 3) return;
    setActionLoading(true);
    try {
      await adminApi.hideReview(modal.review.id, modal.reason.trim());
      addToast("success", "Review hidden successfully");
      if (selectedReview?.id === modal.review.id) {
        setSelectedReview({ ...modal.review, isHidden: true, hideReason: modal.reason.trim() });
      }
      closeModal();
      fetchReviews();
    } catch (err: any) {
      addToast("error", err.response?.data?.message || "Failed to hide review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!modal.review) return;
    setActionLoading(true);
    try {
      await adminApi.restoreReview(modal.review.id, modal.reason.trim() || undefined);
      addToast("success", "Review restored successfully");
      if (selectedReview?.id === modal.review.id) setSelectedReview(null);
      closeModal();
      fetchReviews();
    } catch (err: any) {
      addToast("error", err.response?.data?.message || "Failed to restore review");
    } finally {
      setActionLoading(false);
    }
  };

  const getModalConfig = () => {
    if (modal.action === "hide") {
      return {
        isOpen: modal.isOpen,
        title: "Hide Review",
        message: `Hide this review from public view? Reason is required and will be logged.`,
        confirmText: "Hide Review",
        isDangerous: true,
        isLoading: actionLoading,
        onConfirm: handleHide,
        onCancel: closeModal,
        showInput: true,
        inputType: "textarea" as const,
        inputPlaceholder: "Enter hide reason (required)...",
        confirmDisabled: modal.reason.trim().length < 3,
        onInputChange: (value: string) =>
          setModal((prev) => ({ ...prev, reason: value })),
      };
    }

    if (modal.action === "restore") {
      return {
        isOpen: modal.isOpen,
        title: "Restore Review",
        message: `Restore this review to public visibility?`,
        confirmText: "Restore",
        isDangerous: false,
        isLoading: actionLoading,
        onConfirm: handleRestore,
        onCancel: closeModal,
        showInput: true,
        inputType: "textarea" as const,
        inputPlaceholder: "Optional note for audit log...",
        confirmDisabled: false,
        onInputChange: (value: string) =>
          setModal((prev) => ({ ...prev, reason: value })),
      };
    }

    return {
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
      onCancel: closeModal,
    };
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <nav className="text-xs text-slate-500 sm:text-sm" aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <button
                      type="button"
                      onClick={() => router.push("/admin")}
                      className="font-medium text-slate-600 hover:text-slate-900"
                    >
                      Admin
                    </button>
                  </li>
                  <li className="text-slate-400">/</li>
                  <li className="font-semibold text-slate-900">Review Management</li>
                </ol>
              </nav>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Review Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600">
                  Moderate user reviews, hide inappropriate content, and restore reviews with full audit logging.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mb-6">
            <ReviewFilterBar
              search={filters.search}
              visibility={filters.visibility}
              minRating={filters.minRating}
              maxRating={filters.maxRating}
              onSearchChange={handleSearch}
              onVisibilityChange={handleVisibility}
              onMinRatingChange={handleMinRating}
              onMaxRatingChange={handleMaxRating}
              isLoading={loading}
            />
          </div>

          {error && !loading && !data && (
            <div className="mb-6">
              <ErrorState message={error} />
            </div>
          )}

          <ReviewTable
            reviews={data?.items || []}
            isLoading={loading}
            onHide={openHideModal}
            onRestore={openRestoreModal}
            onView={setSelectedReview}
          />

          {data?.pagination && (
            <div className="mt-6">
              <Pagination
                currentPage={filters.page}
                totalPages={data.pagination.pages}
                pageSize={filters.pageSize}
                totalItems={data.pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setSelectedReview(null)}
          />
          <aside className="relative flex h-screen w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Review Detail
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedReview.job.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-full border border-slate-200 bg-white p-2 text-xs font-bold text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    selectedReview.isHidden
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  }`}
                >
                  {selectedReview.isHidden ? "Hidden" : "Visible"}
                </span>
                <span className="text-amber-500 text-lg">
                  {"★".repeat(selectedReview.rating)}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-400">Author</p>
                  <p className="font-semibold text-slate-800">{selectedReview.author.fullName}</p>
                  <p className="text-xs text-slate-500">{selectedReview.author.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Company</p>
                  <p className="text-slate-700">{selectedReview.job.companyName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Submitted</p>
                  <p className="text-slate-700">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Content
                </h3>
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700">
                  {selectedReview.content}
                </p>
              </div>

              {selectedReview.isHidden && selectedReview.hideReason && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase text-red-600">Hide reason</p>
                  <p className="mt-2 text-sm text-red-800">{selectedReview.hideReason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 p-6">
              {!selectedReview.isHidden ? (
                <button
                  type="button"
                  onClick={() => openHideModal(selectedReview)}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Hide Review
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openRestoreModal(selectedReview)}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Restore Review
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      <ConfirmationModal {...getModalConfig()} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
