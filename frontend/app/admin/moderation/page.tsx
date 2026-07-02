"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModerationJob } from "../../../types/admin.types";
import { useAuth } from "../../../components/auth-provider";
import { useToast } from "../../../hooks/useToast";
import { useModerationQueue } from "../../../hooks/useModerationQueue";
import { adminApi } from "../../../lib/admin-api";
import { ToastContainer } from "../../../components/admin/ToastContainer";
import { ConfirmationModal } from "../../../components/admin/ConfirmationModal";
import { ModerationFilterBar } from "../../../components/admin/ModerationFilterBar";
import { JobQueueTable } from "../../../components/admin/JobQueueTable";
import { Pagination } from "../../../components/admin/Pagination";
import { JobStatusBadge } from "../../../components/admin/JobStatusBadge";
import { ErrorState } from "../../../components/admin/States";

type ModalAction = "approve" | "reject" | null;

interface ActionModalState {
  isOpen: boolean;
  action: ModalAction;
  job: ModerationJob | null;
  rejectReason: string;
}

export default function AdminModerationPage() {
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();
  const { auth, isReady } = useAuth();

  const {
    data,
    loading,
    error,
    filters,
    fetchQueue,
    handleSearch,
    handleStatusFilter,
    handleSortOrderChange,
    handlePageChange,
    handlePageSizeChange,
  } = useModerationQueue(10);

  const [selectedJob, setSelectedJob] = useState<ModerationJob | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<ActionModalState>({
    isOpen: false,
    action: null,
    job: null,
    rejectReason: "",
  });

  useEffect(() => {
    if (!isReady) return;
    if (!auth || auth.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [auth, isReady, router]);

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (error) {
      addToast("error", error);
    }
  }, [error, addToast]);

  const openApproveModal = (job: ModerationJob) => {
    setModal({ isOpen: true, action: "approve", job, rejectReason: "" });
  };

  const openRejectModal = (job: ModerationJob) => {
    setModal({ isOpen: true, action: "reject", job, rejectReason: "" });
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: null, job: null, rejectReason: "" });
  };

  const handleApprove = async () => {
    if (!modal.job) return;
    setActionLoading(true);
    try {
      await adminApi.approveJob(modal.job.id);
      addToast("success", `"${modal.job.title}" approved successfully`);
      if (selectedJob?.id === modal.job.id) setSelectedJob(null);
      closeModal();
      fetchQueue();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Failed to approve job"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!modal.job || !modal.rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await adminApi.rejectJob(modal.job.id, modal.rejectReason.trim());
      addToast("success", `"${modal.job.title}" rejected`);
      if (selectedJob?.id === modal.job.id) setSelectedJob(null);
      closeModal();
      fetchQueue();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Failed to reject job"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getModalConfig = () => {
    if (modal.action === "approve") {
      return {
        isOpen: modal.isOpen,
        title: "Approve Job Posting",
        message: `Approve "${modal.job?.title}" and publish it publicly?`,
        confirmText: "Approve",
        isDangerous: false,
        isLoading: actionLoading,
        onConfirm: handleApprove,
        onCancel: closeModal,
        showInput: false,
      };
    }

    if (modal.action === "reject") {
      return {
        isOpen: modal.isOpen,
        title: "Reject Job Posting",
        message: `Reject "${modal.job?.title}"? A reason is required and will be sent to the employer.`,
        confirmText: "Reject",
        isDangerous: true,
        isLoading: actionLoading,
        onConfirm: handleReject,
        onCancel: closeModal,
        showInput: true,
        inputType: "textarea" as const,
        inputPlaceholder: "Enter reject reason (required)...",
        confirmDisabled: modal.rejectReason.trim().length < 3,
        onInputChange: (value: string) =>
          setModal((prev) => ({ ...prev, rejectReason: value })),
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
              <nav
                className="text-xs text-slate-500 sm:text-sm"
                aria-label="Breadcrumb"
              >
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
                  <li className="font-semibold text-slate-900">
                    Moderation Queue
                  </li>
                </ol>
              </nav>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Job Moderation Queue
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600">
                  Review pending job postings, preview details, and approve or
                  reject with audit logging.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mb-6">
            <ModerationFilterBar
              search={filters.search}
              status={filters.status}
              sortOrder={filters.sortOrder}
              onSearchChange={handleSearch}
              onStatusChange={handleStatusFilter}
              onSortOrderChange={handleSortOrderChange}
              isLoading={loading}
            />
          </div>

          {error && !loading && !data && (
            <div className="mb-6">
              <ErrorState message={error} />
            </div>
          )}

          <JobQueueTable
            jobs={data?.items || []}
            isLoading={loading}
            selectedJobId={selectedJob?.id ?? null}
            onSelectJob={setSelectedJob}
            onApprove={openApproveModal}
            onReject={openRejectModal}
          />

          {data && (
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

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex justify-end overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
          />
          <aside className="relative flex h-screen w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Job Preview
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedJob.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-full border border-slate-200 bg-white p-2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex items-center justify-between">
                <JobStatusBadge status={selectedJob.status} />
                <span className="text-xs text-slate-500">
                  Submitted {new Date(selectedJob.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-400">Company</p>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Location</p>
                  <p className="text-slate-700">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Type</p>
                  <p className="text-slate-700">{selectedJob.type.replace(/_/g, " ")}</p>
                </div>
                {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                  <div>
                    <p className="text-xs font-medium text-slate-400">Salary</p>
                    <p className="text-slate-700">
                      {selectedJob.salaryMin ?? "?"} – {selectedJob.salaryMax ?? "?"} (millions)
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-400">Employer</p>
                  <p className="font-semibold text-slate-800">
                    {selectedJob.employer.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedJob.employer.email}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description
                </h3>
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700">
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Requirements
                </h3>
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700">
                  {selectedJob.requirements}
                </p>
              </div>

              {selectedJob.rejectReason && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase text-red-600">
                    Reject reason
                  </p>
                  <p className="mt-2 text-sm text-red-800">
                    {selectedJob.rejectReason}
                  </p>
                </div>
              )}
            </div>

            {selectedJob.status === "PENDING" && (
              <div className="flex gap-3 border-t border-slate-100 p-6">
                <button
                  type="button"
                  onClick={() => openApproveModal(selectedJob)}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => openRejectModal(selectedJob)}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <ConfirmationModal {...getModalConfig()} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
