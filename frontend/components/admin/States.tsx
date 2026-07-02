import React from "react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 rounded-lg shadow-md p-8 border border-red-200">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-red-600 text-2xl">⚠</span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-red-900">Error</h3>
          <p className="mt-2 text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="text-gray-400 text-4xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
      <p className="text-gray-500">Try adjusting your search filters</p>
    </div>
  );
}
