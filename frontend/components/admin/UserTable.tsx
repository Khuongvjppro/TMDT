import React from "react";
import { User } from "../../types/admin.types";
import { UserActions } from "./UserActions";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  selectedUserIds: number[];
  onToggleUserSelection: (userId: number) => void;
  onToggleSelectAll: () => void;
  onLock: (user: User) => void;
  onUnlock: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onChangeRole: (user: User) => void;
  onAuditLogs: (user: User) => void;
  onViewDetails: (user: User) => void;
}

export function UserTable({
  users,
  isLoading,
  selectedUserIds,
  onToggleUserSelection,
  onToggleSelectAll,
  onLock,
  onUnlock,
  onDelete,
  onRestore,
  onChangeRole,
  onAuditLogs,
  onViewDetails,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    users.length > 0 &&
                    users.every((user) => selectedUserIds.includes(user.id))
                  }
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Name
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              {/* <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Violations
              </th> */}
              <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Joined
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                selected={selectedUserIds.includes(user.id)}
                onToggleSelect={onToggleUserSelection}
                onLock={onLock}
                onUnlock={onUnlock}
                onDelete={onDelete}
                onRestore={onRestore}
                onChangeRole={onChangeRole}
                onAuditLogs={onAuditLogs}
                onViewDetails={onViewDetails}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface UserRowProps {
  user: User;
  selected: boolean;
  onToggleSelect: (userId: number) => void;
  onLock: (user: User) => void;
  onUnlock: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onChangeRole: (user: User) => void;
  onAuditLogs: (user: User) => void;
  onViewDetails: (user: User) => void;
}

function UserRow({ user, selected, onToggleSelect, onLock, onUnlock, onDelete, onRestore, onChangeRole, onAuditLogs, onViewDetails }: UserRowProps) {
  const statusColor = {
    ACTIVE: "bg-green-100 text-green-800",
    LOCKED: "bg-red-100 text-red-800",
    DELETED: "bg-gray-100 text-gray-800",
  }[user.status];

  const roleColor = {
    ADMIN: "bg-purple-100 text-purple-800",
    EMPLOYER: "bg-blue-100 text-blue-800",
    CANDIDATE: "bg-cyan-100 text-cyan-800",
    GUEST: "bg-gray-100 text-gray-800",
  }[user.role];

  const joinedDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(user.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
        <div className="font-medium text-gray-900 truncate">{user.email}</div>
        <div className="md:hidden text-xs text-gray-500">{user.fullName}</div>
      </td>
      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {user.fullName}
      </td>
      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColor}`}
        >
          {user.role}
        </span>
      </td>
      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
        >
          {user.status}
        </span>
      </td>
      {/* <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {user.violationCount > 0 ? (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
            {user.violationCount}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td> */}
      <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {joinedDate}
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
        <UserActions
          user={user}
          onLock={() => onLock(user)}
          onUnlock={() => onUnlock(user)}
          onDelete={() => onDelete(user)}
          onRestore={() => onRestore(user)}
          onChangeRole={() => onChangeRole(user)}
          onAuditLogs={() => onAuditLogs(user)}
          onViewDetails={() => onViewDetails(user)}
        />
      </td>
    </tr>
  );
}
