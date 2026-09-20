// app/error.tsx
"use client"; // Error components must be Client Components

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You could optionally log this to an error reporting service like Sentry
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center font-sans text-center px-6">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-serif font-medium text-gray-900 mb-3 drop-shadow-sm">
        Something went wrong
      </h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        We encountered an unexpected error while trying to load this page. Please try again or return to your dashboard.
      </p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}