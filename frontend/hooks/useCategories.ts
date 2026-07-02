import { useState, useCallback } from "react";
import { CategoryListResponse, CategoryFilters } from "../types/admin.types";
import { adminApi } from "../lib/admin-api";

export function useCategories(initialPageSize = 10) {
  const [data, setData] = useState<CategoryListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
    includeDeleted: false,
    page: 1,
    pageSize: initialPageSize,
  });

  const fetchCategories = useCallback(
    async (newFilters?: Partial<CategoryFilters>) => {
      setLoading(true);
      setError(null);

      try {
        const mergedFilters = { ...filters, ...newFilters };
        setFilters(mergedFilters);

        const response = await adminApi.listCategories({
          search: mergedFilters.search || undefined,
          includeDeleted: mergedFilters.includeDeleted,
          page: mergedFilters.page,
          pageSize: mergedFilters.pageSize,
        });

        setData(response);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to load categories";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const handleSearch = useCallback(
    (search: string) => {
      fetchCategories({ search, page: 1 });
    },
    [fetchCategories]
  );

  const handleIncludeDeleted = useCallback(
    (includeDeleted: boolean) => {
      fetchCategories({ includeDeleted, page: 1 });
    },
    [fetchCategories]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchCategories({ page });
    },
    [fetchCategories]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      fetchCategories({ pageSize, page: 1 });
    },
    [fetchCategories]
  );

  return {
    data,
    loading,
    error,
    filters,
    fetchCategories,
    handleSearch,
    handleIncludeDeleted,
    handlePageChange,
    handlePageSizeChange,
  };
}
