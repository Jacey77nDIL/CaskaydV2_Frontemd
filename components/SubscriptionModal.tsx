// components/SubscriptionModal.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

interface SubscriptionModalProps {
  isOpen: boolean;
  /**
   * YouTube video URL or ID for the platform demo.
   * If null, empty string, or undefined, the video space is completely hidden.
   * Whenever you are ready to add the real video, simply update this URL!
   */
  youtubeUrl?: string | null;
  /**
   * Plan name to initialize, defaults to "INDIVIDUAL".
   */
  planName?: string;
  /**
   * Price in NGN to display, defaults to 2000.
   */
  priceNgn?: number;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats or returns raw ID.
 */
function extractYouTubeId(urlOrId?: string | null): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // If it's already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for standard YouTube URLs
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export default function SubscriptionModal({
  isOpen,
  youtubeUrl = null,
  planName = "INDIVIDUAL",
  priceNgn = 2000,
}: SubscriptionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const videoId = extractYouTubeId(youtubeUrl);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/api/subscriptions/initialize", {
        method: "POST",
        body: JSON.stringify({ plan: planName.toUpperCase() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to initialize payment.");
      }

      const data = await res.json();
      const checkoutUrl =
        data.paymentLink || data.paymentUrl || data.link || data.data?.link;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No payment link received from payment provider.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleReturnToLanding = async () => {
    try {
      await fetchWithAuth("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("caskayd_token");
      localStorage.removeItem("caskayd_refresh_token");
      router.push("/");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onKeyDown={(e) => {
        if (e.key === "Escape") e.preventDefault();
      }}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Sunset Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1d0b34] via-[#d14d1a] to-[#ffda73] flex-shrink-0" />

        <div className="p-5 sm:p-6 flex flex-col">
          {/* Header Badge & Brand */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-extrabold text-lg tracking-tight">
                Caskayd
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#ff6b35]">
                Membership Required
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Instant Access</span>
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900 tracking-tight leading-snug">
            Activate your membership to continue
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Unlock unlimited searches, verified creator demographics, and direct contact details.
          </p>

          {/* Optional YouTube Video Space (conditionally rendered) */}
          {videoId && (
            <div className="mt-3.5 w-full">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Quick Demo Video
                </span>
                <span className="text-[10px] text-gray-400">1 min</span>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-sm border border-gray-200">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title="Caskayd Platform Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Plan Summary Card */}
          <div className="mt-3.5 p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b35]">
                  {planName} PLAN
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  Full Creator Search & Discovery
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-gray-900 tracking-tight">
                  ₦{priceNgn.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">/mo</span>
              </div>
            </div>

            {/* Feature Perks */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-orange-200/50 text-[11px] text-gray-700">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited searches</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Full creator profiles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Direct contact info</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Saved campaigns</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2.5 p-2.5 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-[#1c0512] hover:bg-[#2d0a1d] text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Redirecting to Flutterwave...</span>
                </>
              ) : (
                <>
                  <span>Subscribe Now — ₦{priceNgn.toLocaleString()} / mo</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {/* Non-dismissible exit: Return to Landing Page */}
            <button
              onClick={handleReturnToLanding}
              disabled={loading}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-900 py-1.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to landing page</span>
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-2">
            Secure billing powered by Flutterwave. Pause or cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
