"use client";

import { useEffect, useState } from "react";
import { listUsers, updateUserRole } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { AdminUser, UserRole } from "../../../types";

const ROLES: UserRole[] = ["GUEST", "CANDIDATE", "EMPLOYER", "ADMIN"];

export default function AdminUsersPage() {
  const { auth, isReady } = useAuth();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadUsers() {
    if (!auth?.token) return;
    setIsLoading(true);
    setMessage("");
    try {
      const data = await listUsers(auth.token);
      setItems(data.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load users";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (auth?.user.role === "ADMIN") {
      loadUsers();
    }
  }, [auth?.token, auth?.user.role]);

  async function onChangeRole(userId: number, role: UserRole) {
    if (!auth?.token) return;
    setUpdatingId(userId);
    setMessage("");
    try {
      const data = await updateUserRole(auth.token, userId, role);
      setItems((prev) =>
        prev.map((item) => (item.id === userId ? data.item : item)),
      );
      setMessage(`Updated role for user #${userId} to ${role}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update role failed";
      setMessage(nextMessage);
    } finally {
      setUpdatingId(null);
    }
  }

  if (!isReady) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as ADMIN to manage users.
      </p>
    );
  }

  if (auth.user.role !== "ADMIN") {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}. Login as ADMIN to use this page.
      </p>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
      <h1 className="text-2xl font-black text-slate-900">Admin Users</h1>
      <p className="text-sm text-slate-600">
        Update user roles directly from web UI.
      </p>
      <button
        type="button"
        onClick={loadUsers}
        disabled={isLoading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Refreshing..." : "Refresh Users"}
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Full Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 pr-4">{item.id}</td>
                <td className="py-2 pr-4">{item.fullName}</td>
                <td className="py-2 pr-4">{item.email}</td>
                <td className="py-2 pr-4">
                  <select
                    className="rounded-lg border border-slate-300 px-2 py-1"
                    value={item.role}
                    disabled={updatingId === item.id}
                    onChange={(event) =>
                      onChangeRole(item.id, event.target.value as UserRole)
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message ? (
        <p className="text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
