"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "../../../types/admin.types";
import { useAuth } from "../../../components/auth-provider";
import { useToast } from "../../../hooks/useToast";
import { useCategories } from "../../../hooks/useCategories";
import { adminApi } from "../../../lib/admin-api";
import { ToastContainer } from "../../../components/admin/ToastContainer";
import { ConfirmationModal } from "../../../components/admin/ConfirmationModal";
import { CategoryTable } from "../../../components/admin/CategoryTable";
import { Pagination } from "../../../components/admin/Pagination";
import { ErrorState } from "../../../components/admin/States";

interface FormState {
  isOpen: boolean;
  mode: "create" | "edit";
  category: Category | null;
  name: string;
  description: string;
}

export default function AdminCategoriesPage() {
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();
  const { auth, isReady } = useAuth();

  const {
    data,
    loading,
    error,
    filters,
    fetchCategories,
    handleSearch,
    handleIncludeDeleted,
    handlePageChange,
    handlePageSizeChange,
  } = useCategories(10);

  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    isOpen: false,
    mode: "create",
    category: null,
    name: "",
    description: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  useEffect(() => {
    if (!isReady) return;
    if (!auth || auth.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [auth, isReady, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (error) addToast("error", error);
  }, [error, addToast]);

  const openCreateForm = () => {
    setForm({
      isOpen: true,
      mode: "create",
      category: null,
      name: "",
      description: "",
    });
  };

  const openEditForm = (category: Category) => {
    setForm({
      isOpen: true,
      mode: "edit",
      category,
      name: category.name,
      description: category.description || "",
    });
  };

  const closeForm = () => {
    setForm({
      isOpen: false,
      mode: "create",
      category: null,
      name: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      addToast("error", "Category name is required");
      return;
    }

    setActionLoading(true);
    try {
      if (form.mode === "create") {
        await adminApi.createCategory({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        addToast("success", "Category created successfully");
      } else if (form.category) {
        await adminApi.updateCategory(form.category.id, {
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
        addToast("success", "Category updated successfully");
      }
      closeForm();
      fetchCategories();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Failed to save category"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    setActionLoading(true);
    try {
      await adminApi.deleteCategory(deleteModal.category.id);
      addToast("success", `"${deleteModal.category.name}" deleted`);
      setDeleteModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Failed to delete category"
      );
    } finally {
      setActionLoading(false);
    }
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
                  <li className="font-semibold text-slate-900">Categories</li>
                </ol>
              </nav>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Category Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600">
                  Manage job industry categories with unique names, soft delete, and audit logging.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={openCreateForm}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Name, slug, description..."
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.includeDeleted}
                    onChange={(e) => handleIncludeDeleted(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  Include deleted categories
                </label>
              </div>
            </div>
          </div>

          {error && !loading && !data && (
            <div className="mb-6">
              <ErrorState message={error} />
            </div>
          )}

          <CategoryTable
            categories={data?.items || []}
            isLoading={loading}
            onEdit={openEditForm}
            onDelete={(category) =>
              setDeleteModal({ isOpen: true, category })
            }
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

      {form.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {form.mode === "create" ? "Create Category" : "Edit Category"}
              </h2>
              <button onClick={closeForm} className="text-slate-500 hover:text-slate-900">
                Close
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Name *
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Information Technology"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Optional description..."
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeForm}
                disabled={actionLoading}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading || form.name.trim().length < 2}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading
                  ? "Saving..."
                  : form.mode === "create"
                  ? "Create"
                  : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Category"
        message={`Soft delete "${deleteModal.category?.name}"? It will be hidden from active lists but kept in the database.`}
        confirmText="Delete"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, category: null })}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
