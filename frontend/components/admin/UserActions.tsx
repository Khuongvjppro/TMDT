import React, { useState } from "react";
import { User } from "../../types/admin.types";

interface UserActionsProps {
  user: User;
  onLock: () => void;
  onUnlock: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onChangeRole: () => void;
  onAuditLogs: () => void;
  onViewDetails: () => void;
  isLoading?: boolean;
}

export function UserActions({
  user,
  onLock,
  onUnlock,
  onDelete,
  onRestore,
  onChangeRole,
  onAuditLogs,
  onViewDetails,
  isLoading = false,
}: UserActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative flex items-center gap-1">
      {/* Primary action - always visible */}
      <button
        onClick={onViewDetails}
        disabled={isLoading}
        className="px-2 sm:px-3 py-1 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
        title="View user details"
      >
        View
      </button>

      {/* More menu dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isLoading}
          className="px-2 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 text-xs sm:text-sm"
          title="More actions"
        >
          ▼
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {user.status === "ACTIVE" && (
              <button
                onClick={() => {
                  onLock();
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50"
              >
                🔒 Lock
              </button>
            )}

            {user.status === "LOCKED" && (
              <button
                onClick={() => {
                  onUnlock();
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50"
              >
                🔓 Unlock
              </button>
            )}

            {user.status !== "DELETED" && (
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-600 disabled:opacity-50"
              >
                🗑️ Delete
              </button>
            )}

            {user.status === "DELETED" && (
              <button
                onClick={() => {
                  onRestore();
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-blue-600 disabled:opacity-50"
              >
                ♻️ Restore
              </button>
            )}

            {user.status !== "DELETED" && (
              <button
                onClick={() => {
                  onChangeRole();
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-purple-600 disabled:opacity-50"
              >
                👤 Change Role
              </button>
            )}

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => {
                onAuditLogs();
                setShowMenu(false);
              }}
              disabled={isLoading}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50"
            >
              📋 Audit Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
