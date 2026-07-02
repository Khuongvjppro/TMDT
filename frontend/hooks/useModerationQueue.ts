import { useState, useCallback } from "react";
import {
  ModerationQueueResponse,
  ModerationFilters,
} from "../types/admin.types";
import { adminApi } from "../lib/admin-api";

export function useModerationQueue(initialPageSize = 10) {
  const [data, setData] = useState<ModerationQueueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ModerationFilters>({
    search: "",
    status: "PENDING",
    sortOrder: "desc",
    page: 1,
    pageSize: initialPageSize,
  });

  const fetchQueue = useCallback(
    async (newFilters?: Partial<ModerationFilters>) => {
      setLoading(true);
      setError(null);

      try {
        const mergedFilters = { ...filters, ...newFilters };
        setFilters(mergedFilters);

        const response = await adminApi.getModerationQueue({
          search: mergedFilters.search || undefined,
          status: mergedFilters.status || undefined,
          sortOrder: mergedFilters.sortOrder,
          page: mergedFilters.page,
          pageSize: mergedFilters.pageSize,
        });

        setData(response);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to load moderation queue";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const handleSearch = useCallback(
    (search: string) => {
      fetchQueue({ search, page: 1 });
    },
    [fetchQueue]
  );

  const handleStatusFilter = useCallback(
    (status: ModerationFilters["status"]) => {
      fetchQueue({ status, page: 1 });
    },
    [fetchQueue]
  );

  const handleSortOrderChange = useCallback(
    (sortOrder: "asc" | "desc") => {
      fetchQueue({ sortOrder, page: 1 });
    },
    [fetchQueue]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchQueue({ page });
    },
    [fetchQueue]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      fetchQueue({ pageSize, page: 1 });
    },
    [fetchQueue]
  );

  return {
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
  };
}
