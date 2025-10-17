import React from "react";

const Loading: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-20 pointer-events-auto">
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg min-w-[120px]">
      <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {message && <span className="text-gray-700 text-sm">{message}</span>}
    </div>
  </div>
);

export default Loading;