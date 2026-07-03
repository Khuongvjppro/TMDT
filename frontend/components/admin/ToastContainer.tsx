import React from "react";
import type { Toast as ToastData } from "../../types/admin.types";

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[toast.type];

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto animate-slide-in`}
    >
      <span className="font-bold text-lg">{icon}</span>
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 hover:opacity-75 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
