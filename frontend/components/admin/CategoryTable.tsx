import React from "react";
import { Category } from "../../types/admin.types";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-200" /></td>
      <td className="hidden px-4 py-4 md:table-cell"><div className="h-4 w-32 rounded bg-slate-200" /></td>
      <td className="hidden px-4 py-4 lg:table-cell"><div className="h-4 w-48 rounded bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-6 w-16 rounded-full bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-8 w-24 rounded-full bg-slate-200" /></td>
    </tr>
  );
}

export function CategoryTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="hidden px-4 py-3 md:table-cell">Slug</th>
              <th className="hidden px-4 py-3 lg:table-cell">Description</th>
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

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="text-4xl text-slate-300">🏷️</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No categories found</h3>
        <p className="mt-2 text-sm text-slate-500">Create a category or adjust your search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Name</th>
            <th className="hidden px-4 py-3 md:table-cell">Slug</th>
            <th className="hidden px-4 py-3 lg:table-cell">Description</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">{category.name}</p>
                <p className="text-xs text-slate-500 md:hidden">{category.slug}</p>
              </td>
              <td className="hidden px-4 py-4 text-sm text-slate-600 md:table-cell">
                {category.slug}
              </td>
              <td className="hidden max-w-xs truncate px-4 py-4 text-sm text-slate-600 lg:table-cell">
                {category.description || "—"}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    category.isDeleted
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  }`}
                >
                  {category.isDeleted ? "Deleted" : "Active"}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {!category.isDeleted && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
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
