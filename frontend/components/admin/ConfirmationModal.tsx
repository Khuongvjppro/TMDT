import React, { useState } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  showInput?: boolean;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  showInput = false,
  inputPlaceholder = "Enter reason...",
  onInputChange,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onInputChange?.(e.target.value);
  };

  const handleConfirm = () => {
    onConfirm();
    setInputValue("");
  };

  const handleCancel = () => {
    onCancel();
    setInputValue("");
  };

  const confirmButtonColor = isDangerous
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">{message}</p>

            {showInput && (
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={inputPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                disabled={isLoading}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 ${confirmButtonColor} text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}
            >
              {isLoading && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
