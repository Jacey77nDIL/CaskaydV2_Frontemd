// components/CreatorCard.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export interface PlatformStats {
  followers: string;
  handle: string;
}

export interface Creator {
  id: string;
  name: string;
  niche: string;
  location: string;
  gender: string; 
  imageUrl: string;
  verified: boolean;
  stats: {
    instagram?: PlatformStats;
    tiktok?: PlatformStats;
    twitter?: PlatformStats;
  };
}

interface Campaign {
  id: string;
  name: string;
}

export default function CreatorCard({ creator }: { creator: Creator }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Campaign Modal States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [addingToCampaignId, setAddingToCampaignId] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availablePlatforms = Object.keys(creator.stats) as Array<keyof typeof creator.stats>;
  const [activePlatform, setActivePlatform] = useState<keyof typeof creator.stats>(
    availablePlatforms[0] || "instagram"
  );

  const currentStats = creator.stats[activePlatform];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCampaignModalOpen) {
      fetchCampaigns();
    } else {
      setSuccessMsg(null);
      setCampaignError(null);
    }
  }, [isCampaignModalOpen]);

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    setCampaignError(null);
    try {
      // Swapped to fetchWithAuth
      const res = await fetchWithAuth("/api/campaigns");
      if (!res.ok) throw new Error("Failed to load campaigns");
      
      const data = await res.json();
      const campaignList = Array.isArray(data) ? data : (data.data || []);
      setCampaigns(campaignList);
    } catch (err: any) {
      setCampaignError(err.message || "Could not load campaigns.");
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleAddToCampaign = async (campaignId: string) => {
    setAddingToCampaignId(campaignId);
    setCampaignError(null);
    setSuccessMsg(null);

    try {
      // Swapped to fetchWithAuth
      const res = await fetchWithAuth(`/api/campaigns/${campaignId}/creators`, {
        method: "POST",
        body: JSON.stringify({ creatorId: creator.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add creator to campaign");
      }
      
      setSuccessMsg("Added successfully!");
      
      setTimeout(() => {
        setIsCampaignModalOpen(false);
      }, 1500);

    } catch (err: any) {
      setCampaignError(err.message || "An error occurred");
    } finally {
      setAddingToCampaignId(null);
    }
  };

  const handleSaveToFavorites = async () => {
    setIsSaving(true);
    try {
      // Swapped to fetchWithAuth
      const res = await fetchWithAuth("/api/saved-creators", {
        method: "POST",
        body: JSON.stringify({ creatorId: creator.id }),
      });

      if (!res.ok) throw new Error("Failed to save creator");
      
      setIsSaved(true);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error(error);
      alert("Could not save creator. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col w-full max-w-[300px] font-sans">
        <div className="relative w-full h-56 bg-gray-100">
          <img
            src={creator.imageUrl}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
          
          {availablePlatforms.length > 1 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1 flex gap-1 shadow-sm">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    activePlatform === platform 
                      ? "bg-[#ff6b35] text-white shadow-sm" 
                      : "bg-transparent text-gray-500 hover:bg-gray-200"
                  }`}
                  title={`Switch to ${platform}`}
                >
                  {platform === "instagram" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  )}
                  {platform === "tiktok" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.5 5.54-3.9 7.15-2.4 1.61-5.61 2.15-8.31 1.05-2.7-1.1-4.83-3.66-5.26-6.52-.43-2.86.6-5.83 2.76-7.85 2.16-2.02 5.25-2.78 8.11-1.92v4.21c-1.25-.33-2.61-.17-3.7.53-1.09.7-1.83 1.96-1.85 3.25-.02 1.29.69 2.58 1.76 3.3 1.07.72 2.47.93 3.7.56 1.23-.37 2.2-1.35 2.58-2.58.26-.83.29-1.72.29-2.58.01-4.47.01-8.94.02-13.41h3.94z" /></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <h3 className="font-bold text-gray-900 text-lg">{creator.name}</h3>
            {creator.verified && (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-400 font-light text-sm ml-1">• {creator.niche}</span>
          </div>

          {currentStats ? (
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-5 animate-in fade-in duration-300">
              <div>
                <span className="text-gray-400 text-xs">Handle:</span>{" "}
                <span className="font-semibold text-gray-800 break-all">
                  {currentStats.handle !== "N/A" ? `@${currentStats.handle}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Followers:</span>{" "}
                <span className="font-semibold text-gray-800">{currentStats.followers}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Location:</span>{" "}
                <span className="font-semibold text-gray-800">{creator.location}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Gender:</span>{" "}
                <span className="font-semibold text-gray-800 capitalize">{creator.gender}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 mb-5 italic">Stats unavailable for this platform.</div>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 relative border-t border-gray-100 pt-4">
            <div ref={dropdownRef} className="flex-1 relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Action <span className="text-[10px] opacity-70">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsCampaignModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ff6b35] transition-colors font-medium border-b border-gray-50 cursor-pointer"
                  >
                    Add to campaign
                  </button>
                  <button
                    onClick={handleSaveToFavorites}
                    disabled={isSaving || isSaved}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ff6b35] transition-colors font-medium cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : isSaved ? "Saved ✓" : "Save to favorites"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Selection Modal */}
      {isCampaignModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsCampaignModalOpen(false)}
        >
          <div 
            className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Top Left Close Button */}
            <button 
              onClick={() => setIsCampaignModalOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="px-6 pt-12 pb-4 border-b border-gray-100 text-center">
              <h3 className="text-xl font-serif font-medium tracking-tight text-gray-900">
                Add to Campaign
              </h3>
              <p className="text-sm text-gray-500 mt-1">Select a folder for {creator.name}</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {campaignError && (
                <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-center">
                  {campaignError}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 text-sm text-center font-medium">
                  {successMsg}
                </div>
              )}

              {loadingCampaigns ? (
                <div className="text-center py-8 text-sm text-gray-400">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-4">You don't have any active campaigns.</p>
                  <a href="/campaigns" className="text-[#ff6b35] font-semibold text-sm hover:underline">
                    Create a campaign first
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {campaigns.map((camp) => (
                    <button
                      key={camp.id}
                      onClick={() => handleAddToCampaign(camp.id)}
                      disabled={addingToCampaignId === camp.id || !!successMsg}
                      className="flex items-center justify-between w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#ff6b35]/10 border border-gray-200 hover:border-[#ff6b35]/30 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span className="font-medium text-gray-800 group-hover:text-[#ff6b35] transition-colors">
                        {camp.name}
                      </span>
                      {addingToCampaignId === camp.id ? (
                        <span className="text-[#ff6b35] text-xs font-bold uppercase tracking-wider">Adding...</span>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#ff6b35] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}