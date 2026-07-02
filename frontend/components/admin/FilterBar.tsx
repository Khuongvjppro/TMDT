import React from "react";

interface FilterBarProps {
  search: string;
  role: string;
  status: string;
  sortBy?: "createdAt" | "violationCount" | "role";
  sortOrder?: "asc" | "desc";
  onSearchChange: (search: string) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onSortByChange: (sortBy?: "createdAt" | "violationCount" | "role") => void;
  onSortOrderChange: (sortOrder?: "asc" | "desc") => void;
  isLoading?: boolean;
}

export function FilterBar({
  search,
  role,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  isLoading = false,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 2xl:p-3 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 2xl:gap-2">
        {/* Search */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Email or name..."
            disabled={isLoading}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Roles</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="EMPLOYER">Employer</option>
            <option value="ADMIN">Admin</option>
            <option value="GUEST">Guest</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="LOCKED">Locked</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>

        {/* Sort by */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Sort by
          </label>
          <select
            value={sortBy || ""}
            onChange={(e) => onSortByChange(e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Default</option>
            <option value="createdAt">Joined date</option>
            <option value="violationCount">Violation count</option>
            <option value="role">Role</option>
          </select>
        </div>

        {/* Sort order + Clear button stacked */}
        <div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Sort order
            </label>
            <select
              value={sortOrder || "desc"}
              onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
              disabled={isLoading}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="mt-2 sm:mt-3 flex items-end">
            <button
              onClick={() => {
                onSearchChange("");
                onRoleChange("");
                onStatusChange("");
                onSortByChange(undefined);
                onSortOrderChange(undefined);
              }}
              disabled={isLoading || (!search && !role && !status && !sortBy && !sortOrder)}
              className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
