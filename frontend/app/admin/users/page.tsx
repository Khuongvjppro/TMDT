"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuditLog, User } from "../../../types/admin.types";
import { useAuth } from "../../../components/auth-provider";
import { useToast } from "../../../hooks/useToast";
import { useUsers } from "../../../hooks/useUsers";
import { adminApi } from "../../../lib/admin-api";
import { ToastContainer } from "../../../components/admin/ToastContainer";
import { ConfirmationModal } from "../../../components/admin/ConfirmationModal";
import { FilterBar } from "../../../components/admin/FilterBar";
import { UserTable } from "../../../components/admin/UserTable";
import { Pagination } from "../../../components/admin/Pagination";

type ActionType = "lock" | "unlock" | "delete" | null;

interface ModalState {
  isOpen: boolean;
  action: ActionType;
  user: User | null;
  reason: string;
}

interface RoleModalState {
  isOpen: boolean;
  user: User | null;
  selectedRole: User["role"];
  isLoading: boolean;
}

interface AuditModalState {
  isOpen: boolean;
  user: User | null;
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
}

export default function AdminUsersPage() {
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();
  const { auth, isReady } = useAuth();

  const {
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
  } = useUsers(10);

  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    action: null,
    user: null,
    reason: "",
  });
  const [roleModal, setRoleModal] = useState<RoleModalState>({
    isOpen: false,
    user: null,
    selectedRole: "CANDIDATE",
    isLoading: false,
  });
  const [auditModal, setAuditModal] = useState<AuditModalState>({
    isOpen: false,
    user: null,
    logs: [],
    loading: false,
    error: null,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkRole, setBulkRole] = useState<User["role"]>("CANDIDATE");
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    fullName: "",
    email: "",
    role: "CANDIDATE" as User["role"],
    password: "",
    invite: false,
  });

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  // Redirect if not authenticated as ADMIN
  useEffect(() => {
    if (!isReady) return;
    if (!auth || auth.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [auth, isReady, router]);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Error handling
  useEffect(() => {
    if (error) {
      addToast("error", error);
    }
  }, [error, addToast]);

  // Open modal for action
  const openModal = (action: ActionType, user: User) => {
    setModal({
      isOpen: true,
      action,
      user,
      reason: "",
    });
  };

  // Close modal
  const closeModal = () => {
    setModal({
      isOpen: false,
      action: null,
      user: null,
      reason: "",
    });
  };

  const openRoleModal = (user: User) => {
    setRoleModal({
      isOpen: true,
      user,
      selectedRole: user.role,
      isLoading: false,
    });
  };

  const closeRoleModal = () => {
    setRoleModal({
      isOpen: false,
      user: null,
      selectedRole: "CANDIDATE",
      isLoading: false,
    });
  };

  const openAuditModal = async (user: User) => {
    setAuditModal({
      isOpen: true,
      user,
      logs: [],
      loading: true,
      error: null,
    });

    try {
      const logs = await adminApi.getUserAuditLogs(user.id);
      setAuditModal({
        isOpen: true,
        user,
        logs,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setAuditModal({
        isOpen: true,
        user,
        logs: [],
        loading: false,
        error:
          err.response?.data?.message || "Failed to load audit logs",
      });
    }
  };

  const closeAuditModal = () => {
    setAuditModal({
      isOpen: false,
      user: null,
      logs: [],
      loading: false,
      error: null,
    });
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.items) return;
    const allSelected = data.items.every((user) =>
      selectedUserIds.includes(user.id)
    );
    setSelectedUserIds(allSelected ? [] : data.items.map((user) => user.id));
  };

  const openCreateModal = () => {
    setCreateModal({
      isOpen: true,
      fullName: "",
      email: "",
      role: "CANDIDATE",
      password: "",
      invite: false,
    });
  };

  const closeCreateModal = () => {
    setCreateModal({
      isOpen: false,
      fullName: "",
      email: "",
      role: "CANDIDATE",
      password: "",
      invite: false,
    });
  };

  const handleCreateUser = async () => {
    setActionLoading(true);
    try {
      await adminApi.createUser({
        fullName: createModal.fullName,
        email: createModal.email,
        password: createModal.invite ? undefined : createModal.password,
        role: createModal.role,
        invite: createModal.invite,
      });
      addToast(
        "success",
        createModal.invite
          ? "User invited successfully"
          : "User created successfully"
      );
      fetchUsers();
      closeCreateModal();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Failed to create user"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (
    action: "lock" | "unlock" | "delete" | "restore"
  ) => {
    if (!selectedUserIds.length) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedUserIds.map((userId) => {
          switch (action) {
            case "lock":
              return adminApi.lockUser(userId);
            case "unlock":
              return adminApi.unlockUser(userId);
            case "delete":
              return adminApi.deleteUser(userId);
            case "restore":
              return adminApi.restoreUser(userId);
          }
        })
      );
      addToast(
        "success",
        `Bulk ${action} completed for ${selectedUserIds.length} users.`
      );
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Bulk action failed"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRoleUpdate = async () => {
    if (!selectedUserIds.length) return;
    setBulkLoading(true);
    try {
      await adminApi.bulkUpdateUserRoles(selectedUserIds, bulkRole);
      addToast(
        "success",
        `Updated role for ${selectedUserIds.length} users to ${bulkRole}`
      );
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      addToast(
        "error",
        err.response?.data?.message || "Bulk role update failed"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // Lock user
  const handleLockUser = async () => {
    if (!modal.user) return;

    setActionLoading(true);
    try {
      await adminApi.lockUser(modal.user.id, modal.reason);
      addToast("success", `User ${modal.user.email} locked successfully`);
      fetchUsers();
      closeModal();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to lock user";
      addToast("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  // Unlock user
  const handleUnlockUser = async () => {
    if (!modal.user) return;

    setActionLoading(true);
    try {
      await adminApi.unlockUser(modal.user.id, modal.reason);
      addToast("success", `User ${modal.user.email} unlocked successfully`);
      fetchUsers();
      closeModal();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to unlock user";
      addToast("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!modal.user) return;

    setActionLoading(true);
    try {
      await adminApi.deleteUser(modal.user.id, modal.reason);
      addToast("success", `User ${modal.user.email} deleted successfully`);
      fetchUsers();
      closeModal();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to delete user";
      addToast("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async (user: User) => {
    setActionLoading(true);
    try {
      await adminApi.restoreUser(user.id);
      addToast("success", `User ${user.email} restored successfully`);
      fetchUsers();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to restore user";
      addToast("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  // Get modal config based on action
  const getModalConfig = () => {
    const baseConfig = {
      isOpen: modal.isOpen,
      isLoading: actionLoading,
      onCancel: closeModal,
      onInputChange: (value: string) => setModal({ ...modal, reason: value }),
      showInput: true,
      inputPlaceholder: "Enter reason (optional)...",
    };

    switch (modal.action) {
      case "lock":
        return {
          ...baseConfig,
          title: "Lock User Account",
          message: `Are you sure you want to lock ${modal.user?.email}? They won't be able to login.`,
          confirmText: "Lock Account",
          isDangerous: true,
          onConfirm: handleLockUser,
        };
      case "unlock":
        return {
          ...baseConfig,
          title: "Unlock User Account",
          message: `Are you sure you want to unlock ${modal.user?.email}? They will be able to login again.`,
          confirmText: "Unlock Account",
          isDangerous: false,
          onConfirm: handleUnlockUser,
        };
      case "delete":
        return {
          ...baseConfig,
          title: "Delete User Account",
          message: `Are you sure you want to delete ${modal.user?.email}? This cannot be undone.`,
          confirmText: "Delete Account",
          isDangerous: true,
          onConfirm: handleDeleteUser,
        };
      default:
        return {
          ...baseConfig,
          title: "",
          message: "",
          onConfirm: () => {},
        };
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 py-8">
      {/* <div className="w-full mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6 2xl:gap-3 2xl:px-2">
        <div className="max-w-[91.5%] space-y-8"> */}
      {/* <div className="w-full mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6"> */}
      <div className="w-full mx-auto max-w-7xl px-4 flex flex-col lg:flex-row lg:justify-center items-start gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 2xl:p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-4">
                <nav className="text-xs sm:text-sm text-slate-500" aria-label="Breadcrumb">
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
                    <li className="font-semibold text-slate-900">User Management</li>
                  </ol>
                </nav>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="mt-2 max-w-2xl text-xs sm:text-sm text-gray-600">
                    Manage users, lock/unlock accounts, and review audit logs with a wider, easier-to-scan layout.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 whitespace-nowrap"
                >
                  Back
                </button>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Create User
                </button>
              </div>
            </div>

            {/* Filter Bar */}

          <FilterBar
            search={filters.search}
            role={filters.role}
            status={filters.status}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSearchChange={handleSearch}
            onRoleChange={handleRoleFilter}
            onStatusChange={handleStatusFilter}
            onSortByChange={(sortBy) => {
              fetchUsers({ sortBy, page: 1 });
            }}
            onSortOrderChange={(sortOrder) => {
              fetchUsers({ sortOrder, page: 1 });
            }}
            isLoading={loading}
          />

          {selectedUserIds.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{selectedUserIds.length} user(s) selected</p>
                  <p className="text-slate-600">Perform bulk actions on selected users.</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value as User["role"])}
                    disabled={bulkLoading}
                    className="rounded-full border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYER">Employer</option>
                    <option value="CANDIDATE">Candidate</option>
                    <option value="GUEST">Guest</option>
                  </select>
                  <button
                    onClick={handleBulkRoleUpdate}
                    disabled={bulkLoading}
                    className="rounded-full bg-purple-500 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm hover:bg-purple-600 disabled:opacity-50 whitespace-nowrap"
                  >
                    Change role
                  </button>
                  <button
                    onClick={() => handleBulkAction("lock")}
                    disabled={bulkLoading}
                    className="rounded-full bg-red-500 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    Lock
                  </button>
                  <button
                    onClick={() => handleBulkAction("unlock")}
                    disabled={bulkLoading}
                    className="rounded-full bg-green-500 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    Unlock
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    disabled={bulkLoading}
                    className="rounded-full bg-orange-500 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm hover:bg-orange-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleBulkAction("restore")}
                    disabled={bulkLoading}
                    className="rounded-full bg-blue-500 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Table */}
          {/* <div className="relative w-full lg:gap-7 overflow-x-auto rounded-xl border border-slate-100"> */}

          {/* <UserTable
            users={data?.items || []}
            isLoading={loading}
            selectedUserIds={selectedUserIds}
            onToggleUserSelection={toggleUserSelection}
            onToggleSelectAll={toggleSelectAll}
            onLock={(user) => openModal("lock", user)}
            onUnlock={(user) => openModal("unlock", user)}
            onDelete={(user) => openModal("delete", user)}
            onRestore={handleRestoreUser}
            onChangeRole={(user) => openRoleModal(user)}
            onAuditLogs={(user) => openAuditModal(user)}
            onViewDetails={(user) => openUserDetails(user)}
          /> */}
          <div className="relative w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <UserTable
                  users={data?.items || []}
                  isLoading={loading}
                  selectedUserIds={selectedUserIds}
                  onToggleUserSelection={toggleUserSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onLock={(user) => openModal("lock", user)}
                  onUnlock={(user) => openModal("unlock", user)}
                  onDelete={(user) => openModal("delete", user)}
                  onRestore={handleRestoreUser}
                  onChangeRole={(user) => openRoleModal(user)}
                  onAuditLogs={(user) => openAuditModal(user)}
                  onViewDetails={(user) => openUserDetails(user)} 
                />
              </div>
            </div>
          </div>
          {/* </div> */}
        {/* Pagination */}
        {data && (
          <Pagination
            currentPage={filters.page}
            totalPages={data.pagination.pages}
            pageSize={filters.pageSize}
            totalItems={data.pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={loading}
          />
        )}
          </div>
        </div>
        {/* {selectedUser && (
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit lg:max-h-[calc(100vh-200px)] lg:sticky lg:top-24 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 truncate">
                User profile
              </p>
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900 truncate">
                {selectedUser.fullName}
              </h2>
            </div>
            <button
              onClick={closeUserDetails}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
                Account
              </p>
              <div className="grid gap-2 text-xs lg:text-sm text-slate-700">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-600">Email</span>
                  <span className="break-all text-slate-700">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Role</span>
                  <span className="text-right">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Status</span>
                  <span className="text-right">{selectedUser.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Violations</span>
                  <span className="text-right">{selectedUser.violationCount}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
                Meta
              </p>
              <div className="grid gap-2 text-xs lg:text-sm text-slate-700 space-y-2">
                <div>
                  <span className="font-medium text-slate-600 block">Joined</span>
                  <span className="text-slate-700 text-xs break-all">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600 block">Updated</span>
                  <span className="text-slate-700 text-xs break-all">{new Date(selectedUser.updatedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600 block">Locked at</span>
                  <span className="text-slate-700 text-xs break-all">{selectedUser.lockedAt ? new Date(selectedUser.lockedAt).toLocaleString() : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        )}
      </div> */}
      {/* DRAWER MODAL HỒ SƠ CHI TIẾT CAO CẤP: Làm mờ hậu cảnh 30%, trượt từ cạnh phải */}
     {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" role="dialog" aria-modal="true">
          {/* Lớp nền đen mờ 30% kết hợp hiệu ứng blur nhẹ */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={closeUserDetails}
          />

          {/* Panel trượt vào bên phải màn hình */}
          <aside className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header của Profile */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <span className="text-lg font-bold">👤</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedUser.fullName}</h2>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Administrator Profile</p>
                </div>
              </div>
              <button
                onClick={closeUserDetails}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 hover:text-slate-700 hover:shadow-sm transition-all text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Nội dung chi tiết cuộn dọc */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* PHẦN VIOLATION ĐƯỢC ĐẨY LÊN THÀNH ĐIỂM NHẤN CHÍNH */}
              <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
                (selectedUser as any).violationCount > 0 
                  ? "border-amber-200 bg-amber-50/60 text-amber-900" 
                  : "border-slate-100 bg-slate-50/60 text-slate-700"
              }`}>
                <div className={`p-3 rounded-xl text-xl ${
                  (selectedUser as any).violationCount > 0 ? "bg-amber-100 text-amber-700" : "bg-white text-slate-400"
                }`}>
                  ⚠️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Violation History</p>
                  <p className="text-2xl font-black mt-0.5">
                    {(selectedUser as any).violationCount ?? 0} <span className="text-sm font-normal opacity-70">record(s)</span>
                  </p>
                </div>
              </div>

              {/* Khối thông tin Account chính */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Account Information</h3>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-3.5 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-slate-400">Email Address</p>
                    <p className="font-semibold text-slate-800 break-all mt-0.5">{selectedUser.email}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-400">Account Role</span>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {selectedUser.role}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-400">Status</span>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      selectedUser.status === "ACTIVE" 
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10" 
                        : "bg-red-50 text-red-700 ring-red-600/10"
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Khối thông tin Meta thời gian */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">System Logs</h3>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-3.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">📅 Date Joined:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedUser.createdAt).toLocaleString("en-US")}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="text-slate-400">🔄 Last Updated:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedUser.updatedAt).toLocaleString("en-US")}
                    </span>
                  </div>

                  {selectedUser.lockedAt && (
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-red-600 bg-red-50/50 -mx-4 px-4 py-2 rounded-b-xl">
                      <span className="font-medium">🛑 Account Locked At:</span>
                      <span className="font-bold">
                        {new Date(selectedUser.lockedAt).toLocaleString("en-US")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </aside>
        </div>
      )}

      <ConfirmationModal {...getModalConfig()} />

      {/* Create User Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create New User</h2>
              <button
                onClick={closeCreateModal}
                className="text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  value={createModal.fullName}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Jane Doe"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={createModal.email}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="jane@example.com"
                />
              </label>
              <div className="flex flex-col gap-3">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={createModal.invite}
                    onChange={(e) =>
                      setCreateModal((prev) => ({
                        ...prev,
                        invite: e.target.checked,
                        password: e.target.checked ? "" : prev.password,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Send invite email instead of setting password
                </label>
                {!createModal.invite && (
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                    <input
                      type="password"
                      value={createModal.password}
                      onChange={(e) =>
                        setCreateModal((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Minimum 6 characters"
                    />
                  </label>
                )}
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Role
                <select
                  value={createModal.role}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      role: e.target.value as User["role"],
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYER">Employer</option>
                  <option value="CANDIDATE">Candidate</option>
                  <option value="GUEST">Guest</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeCreateModal}
                disabled={actionLoading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={
                  actionLoading ||
                  !createModal.fullName ||
                  !createModal.email ||
                  (!createModal.invite && createModal.password.length < 6)
                }
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading
                  ? createModal.invite
                    ? "Sending invite..."
                    : "Creating..."
                  : createModal.invite
                  ? "Send Invite"
                  : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Change User Role</h2>
              <button
                onClick={closeRoleModal}
                className="text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Update the role for <strong>{roleModal.user?.email}</strong>.
            </p>
            <select
              value={roleModal.selectedRole}
              onChange={(e) =>
                setRoleModal((prev) => ({
                  ...prev,
                  selectedRole: e.target.value as User["role"],
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={roleModal.isLoading}
            >
              <option value="ADMIN">Admin</option>
              <option value="EMPLOYER">Employer</option>
              <option value="CANDIDATE">Candidate</option>
              <option value="GUEST">Guest</option>
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeRoleModal}
                disabled={roleModal.isLoading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!roleModal.user) return;
                  setRoleModal((prev) => ({ ...prev, isLoading: true }));
                  try {
                    await adminApi.updateUserRole(
                      roleModal.user.id,
                      roleModal.selectedRole
                    );
                    addToast(
                      "success",
                      `User ${roleModal.user.email} role updated to ${roleModal.selectedRole}`
                    );
                    fetchUsers();
                    closeRoleModal();
                  } catch (err: any) {
                    addToast(
                      "error",
                      err.response?.data?.message ||
                        "Failed to update user role"
                    );
                    setRoleModal((prev) => ({ ...prev, isLoading: false }));
                  }
                }}
                disabled={roleModal.isLoading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {roleModal.isLoading ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {auditModal.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Audit Logs</h2>
                <p className="text-sm text-slate-600">
                  Activity for <strong>{auditModal.user?.email}</strong>.
                </p>
              </div>
              <button
                onClick={closeAuditModal}
                className="text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {auditModal.loading ? (
                <div className="py-10 text-center text-slate-600">
                  Loading audit logs...
                </div>
              ) : auditModal.error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {auditModal.error}
                </div>
              ) : auditModal.logs.length === 0 ? (
                <div className="py-10 text-center text-slate-600">
                  No audit logs found.
                </div>
              ) : (
                <div className="space-y-4">
                  {auditModal.logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900">
                          {log.action}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-3 border border-slate-200">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Performed by</div>
                          <p className="text-sm text-slate-700">{log.user.fullName}</p>
                          <p className="text-xs text-slate-500">{log.user.email}</p>
                        </div>
                        {log.targetUserId !== null && (
                          <div className="rounded-xl bg-white p-3 border border-slate-200">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Target user id</div>
                            <p className="text-sm text-slate-700">{log.targetUserId}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 rounded-xl bg-white p-4 border border-slate-200">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Details</div>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <ul className="space-y-2 text-sm text-slate-700">
                            {Object.entries(log.details).map(([key, value]) => (
                              <li key={key}>
                                <span className="font-semibold">{key}:</span>{" "}
                                <span className="break-words">
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">No additional details.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
    </div>
  );
}

