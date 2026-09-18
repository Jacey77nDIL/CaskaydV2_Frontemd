// app/(dashboard)/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api"; 

interface Subscription {
  plan: string;
  status: string;
  expiresAt: string;
}

interface RecentCampaign {
  id: string;
  name: string;
  createdAt: string;
}

interface RecentCreator {
  id: string;
  creatorId: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
    state: string;
    country: string;
  };
}

interface DashboardData {
  campaignCount: number;
  savedCreatorCount: number;
  currentSubscription: Subscription | null;
  recentCampaigns: RecentCampaign[];
  recentSavedCreators: RecentCreator[];
}

// --- Custom Platform Dropdown UI ---
function CustomPlatformDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const platforms = [
    {
      name: "Instagram",
      icon: (
        <svg className="w-4 h-4 mr-2.5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      icon: (
        <svg className="w-4 h-4 mr-2.5 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
        </svg>
      ),
    },
  ];

  const activePlatform = platforms.find((p) => p.name === value) || platforms[0];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900 cursor-pointer"
      >
        <div className="flex items-center">
          {activePlatform.icon}
          {activePlatform.name}
        </div>
        <span className="text-[10px] opacity-70">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {platforms.map((opt) => (
            <button
              key={opt.name}
              type="button"
              onClick={() => {
                onChange(opt.name);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-sm transition-colors cursor-pointer ${
                value === opt.name
                  ? "bg-gray-50 text-[#ff6b35] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#ff6b35] font-medium"
              }`}
            >
              {opt.icon}
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    campaignCount: 0,
    savedCreatorCount: 0,
    currentSubscription: null,
    recentCampaigns: [],
    recentSavedCreators: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Modal & Toast State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestLink, setSuggestLink] = useState("");
  const [suggestPlatform, setSuggestPlatform] = useState("Instagram");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetchWithAuth("/api/dashboard", {
          method: "GET",
        });

        if (!res.ok) {
          const errorText = await res.text();
          let backendMsg = res.statusText;
          
          try {
            const errorData = JSON.parse(errorText);
            
            if (errorData?.error?.message) {
              backendMsg = Array.isArray(errorData.error.message) 
                ? errorData.error.message.join(", ") 
                : errorData.error.message;
            } else if (errorData?.message) {
              backendMsg = Array.isArray(errorData.message) 
                ? errorData.message.join(", ") 
                : errorData.message;
            } else {
              backendMsg = JSON.stringify(errorData);
            }
          } catch (parseErr) {
            backendMsg = errorText || "Unknown error occurred";
          }
          
          throw new Error(`Backend Error: ${backendMsg}`);
        }

        const apiData = await res.json();
        
        setData({
          campaignCount: apiData.campaignCount || 0,
          savedCreatorCount: apiData.savedCreatorCount || 0,
          currentSubscription: apiData.currentSubscription || null,
          recentCampaigns: apiData.recentCampaigns || [],
          recentSavedCreators: apiData.recentSavedCreators || [],
        });
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Could not load your latest metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // --- Mock Submission Handler with Loading State ---
  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate network delay for the loading spinner
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    setSuggestName("");
    setSuggestLink("");
    setSuggestPlatform("Instagram");
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col font-sans text-gray-900 relative">
      
      {/* Header Section */}
      <div className="mb-10 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-3 drop-shadow-sm leading-tight">
            Welcome back
          </h1>
          <p className="text-base text-gray-500 font-light max-w-xl">
            Here is an overview of your current influencer marketing efforts and recent activity.
          </p>
        </div>
        
        {/* Suggest Creator Button (Larger & Centered) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#ff6b35] text-white hover:bg-[#e05a2b] transition-all px-6 py-3.5 rounded-xl shadow-md font-semibold text-base cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Suggest Creator
        </button>
      </div>

      {error && (
        <div className="mb-6 text-red-500 bg-red-50 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        
        {/* Metric 1: Campaigns */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Campaigns</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-serif font-medium text-gray-900 mt-auto">
            {loading ? <span className="animate-pulse text-gray-300">...</span> : data.campaignCount}
          </div>
        </div>

        {/* Metric 2: Saved Creators */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Creators</h3>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-serif font-medium text-gray-900 mt-auto">
            {loading ? <span className="animate-pulse text-gray-300">...</span> : data.savedCreatorCount}
          </div>
        </div>

        {/* Metric 3: Subscription Plan */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Plan</h3>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-serif font-medium text-gray-900 mt-auto capitalize">
            {loading ? (
              <span className="animate-pulse text-gray-300">...</span>
            ) : data.currentSubscription ? (
              data.currentSubscription.plan.toLowerCase()
            ) : (
              "None"
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Recent Campaigns */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Recent Campaigns</h3>
            <Link href="/campaigns" className="text-xs font-bold text-[#ff6b35] hover:underline uppercase tracking-wider">
              View All
            </Link>
          </div>
          <div className="p-2 flex-1">
            {loading ? (
              <div className="p-4 text-sm text-gray-400">Loading campaigns...</div>
            ) : data.recentCampaigns.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No campaigns created yet.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.recentCampaigns.map((camp) => (
                  <li key={camp.id} className="p-4 hover:bg-gray-50 rounded-xl transition-colors flex justify-between items-center">
                    <span className="font-medium text-gray-800">{camp.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(camp.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Saved Creators */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Recently Saved</h3>
            <Link href="/favorites" className="text-xs font-bold text-[#ff6b35] hover:underline uppercase tracking-wider">
              View All
            </Link>
          </div>
          <div className="p-2 flex-1">
            {loading ? (
              <div className="p-4 text-sm text-gray-400">Loading creators...</div>
            ) : data.recentSavedCreators.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No creators saved yet.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.recentSavedCreators.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-4">
                    <img 
                      src={item.creator.profileImage || `https://i.pravatar.cc/150?u=${item.creator.id}`} 
                      alt={item.creator.name}
                      className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-gray-800 text-sm">{item.creator.name}</span>
                      <span className="text-xs text-gray-500">
                        {item.creator.state ? `${item.creator.state}, ` : ""}{item.creator.country}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(item.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-10 text-center">
        <h2 className="text-2xl font-serif font-medium text-gray-900 mb-3">Ready to scale your reach?</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Find the perfect creators for your next big campaign using our advanced search engine, or jump back into managing your existing network.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/search"
            className="w-full sm:w-auto bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md text-sm text-center"
          >
            Find New Creators
          </Link>
          <Link 
            href="/campaigns"
            className="w-full sm:w-auto bg-white text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm text-sm text-center"
          >
            Manage Campaigns
          </Link>
        </div>
      </div>

      {/* Suggest Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Suggest a Creator</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSuggestSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  required
                  value={suggestName}
                  onChange={(e) => setSuggestName(e.target.value)}
                  placeholder="Creator's full name"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username / Link</label>
                <input
                  type="text"
                  required
                  value={suggestLink}
                  onChange={(e) => setSuggestLink(e.target.value)}
                  placeholder="@username or profile URL"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</label>
                <CustomPlatformDropdown 
                  value={suggestPlatform} 
                  onChange={setSuggestPlatform} 
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center min-w-[100px] bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm text-sm cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Creator suggested successfully!</span>
        </div>
      )}

    </div>
  );
}