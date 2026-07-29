// app/(dashboard)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api"; // <-- We import the helper here

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Swapped to fetchWithAuth so it uses the env variable automatically
        const res = await fetchWithAuth("/api/dashboard");

        if (!res.ok) throw new Error("Failed to load dashboard metrics.");

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
        setError("Could not load your latest metrics.");
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

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col font-sans text-gray-900">
      
      {/* Header Section */}
      <div className="mb-10 mt-2">
        <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-3 drop-shadow-sm leading-tight">
          Welcome back
        </h1>
        <p className="text-base text-gray-500 font-light max-w-xl">
          Here is an overview of your current influencer marketing efforts and recent activity.
        </p>
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

    </div>
  );
}