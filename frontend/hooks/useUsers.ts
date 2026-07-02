import { useState, useCallback } from "react";
import { ListUsersResponse, Filters } from "../types/admin.types";
import { adminApi } from "../lib/admin-api";

export function useUsers(initialPageSize = 10) {
  const [data, setData] = useState<ListUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    role: "",
    status: "",
    sortBy: undefined,
    sortOrder: undefined,
    page: 1,
    pageSize: initialPageSize,
  });

  const fetchUsers = useCallback(async (newFilters?: Partial<Filters>) => {
    setLoading(true);
    setError(null);

    try {
      const mergedFilters = { ...filters, ...newFilters };
      setFilters(mergedFilters);

      const response = await adminApi.listUsers({
        search: mergedFilters.search || undefined,
        role: mergedFilters.role || undefined,
        status: mergedFilters.status || undefined,
        sortBy: mergedFilters.sortBy,
        sortOrder: mergedFilters.sortOrder,
        page: mergedFilters.page,
        pageSize: mergedFilters.pageSize,
      });

      setData(response);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load users";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleSearch = useCallback(
    (search: string) => {
      fetchUsers({ search, page: 1 });
    },
    [fetchUsers]
  );

  const handleRoleFilter = useCallback(
    (role: string) => {
      fetchUsers({ role, page: 1 });
    },
    [fetchUsers]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      fetchUsers({ status, page: 1 });
    },
    [fetchUsers]
  );

  const handleSortByChange = useCallback(
    (sortBy?: Filters["sortBy"]) => {
      fetchUsers({ sortBy, page: 1 });
    },
    [fetchUsers]
  );

  const handleSortOrderChange = useCallback(
    (sortOrder?: Filters["sortOrder"]) => {
      fetchUsers({ sortOrder, page: 1 });
    },
    [fetchUsers]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchUsers({ page });
    },
    [fetchUsers]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      fetchUsers({ pageSize, page: 1 });
    },
    [fetchUsers]
  );

  return {
    data,
    loading,
    error,
    filters,
    fetchUsers,
    handleSearch,
    handleRoleFilter,
    handleStatusFilter,
    handlePageChange,
    handlePageSizeChange,
  };
}
