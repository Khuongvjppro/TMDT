import { useState, useCallback } from "react";
import { ReviewListResponse, ReviewFilters } from "../types/admin.types";
import { adminApi } from "../lib/admin-api";

export function useAdminReviews(initialPageSize = 10) {
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    search: "",
    visibility: "all",
    minRating: "",
    maxRating: "",
    page: 1,
    pageSize: initialPageSize,
  });

  const fetchReviews = useCallback(
    async (newFilters?: Partial<ReviewFilters>) => {
      setLoading(true);
      setError(null);

      try {
        const merged = { ...filters, ...newFilters };
        setFilters(merged);

        const response = await adminApi.listReviews({
          search: merged.search || undefined,
          visibility: merged.visibility,
          minRating: merged.minRating ? Number(merged.minRating) : undefined,
          maxRating: merged.maxRating ? Number(merged.maxRating) : undefined,
          page: merged.page,
          pageSize: merged.pageSize,
        });

        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  return {
    data,
    loading,
    error,
    filters,
    fetchReviews,
    handleSearch: (search: string) => fetchReviews({ search, page: 1 }),
    handleVisibility: (visibility: ReviewFilters["visibility"]) =>
      fetchReviews({ visibility, page: 1 }),
    handleMinRating: (minRating: string) =>
      fetchReviews({ minRating, page: 1 }),
    handleMaxRating: (maxRating: string) =>
      fetchReviews({ maxRating, page: 1 }),
    handlePageChange: (page: number) => fetchReviews({ page }),
    handlePageSizeChange: (pageSize: number) =>
      fetchReviews({ pageSize, page: 1 }),
  };
}
