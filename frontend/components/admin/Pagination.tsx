import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Items Info */}
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Items per page:</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          disabled={isLoading}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          ← Prev
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-2 py-1 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              disabled={isLoading || page === currentPage}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
