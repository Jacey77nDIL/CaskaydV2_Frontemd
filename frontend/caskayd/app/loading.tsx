// app/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center font-sans">
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute w-12 h-12 border-4 border-[#ff6b35] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-400 animate-pulse tracking-wide uppercase">
        Loading Caskayd...
      </p>
    </div>
  );
}