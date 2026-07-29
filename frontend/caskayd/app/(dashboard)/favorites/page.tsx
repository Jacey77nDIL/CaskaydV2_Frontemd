// app/(dashboard)/favorites/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import CreatorCard, { Creator } from "../../../components/CreatorCard";
import { fetchWithAuth } from "@/lib/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const formatFollowers = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const transformApiToCreator = (apiData: any): Creator => {
    const creatorData = apiData.creator || apiData;
    const stats: any = {};
    let isVerified = false;

    if (creatorData.platforms && Array.isArray(creatorData.platforms)) {
      creatorData.platforms.forEach((p: any) => {
        const platformName = (p.platform || "instagram").toLowerCase() as "instagram" | "tiktok" | "twitter";
        if (p.verified) isVerified = true;
        stats[platformName] = {
          followers: formatFollowers(p.followers || 0),
          handle: p.handle || "N/A",
        };
      });
    }

    const locationParts = [];
    if (creatorData.state) locationParts.push(creatorData.state);
    if (creatorData.country) locationParts.push(creatorData.country);

    return {
      id: creatorData.id || creatorData._id,
      name: creatorData.name || "Unknown Creator",
      niche: creatorData.primaryNiche && creatorData.primaryNiche !== "Unspecified" 
        ? creatorData.primaryNiche 
        : "Creator",
      location: locationParts.length > 0 ? locationParts.join(", ") : "N/A",
      gender: creatorData.gender || "Unspecified",
      imageUrl: creatorData.profileImage || `https://i.pravatar.cc/400?u=${creatorData.id || "default"}`,
      verified: isVerified,
      stats: Object.keys(stats).length > 0 
        ? stats 
        : { instagram: { followers: "0", handle: "N/A" } },
    };
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      

      const res = await fetchWithAuth("/api/saved-creators");

      if (!res.ok) throw new Error("Failed to load saved creators.");

      const data = await res.json();
      const creatorList = Array.isArray(data) ? data : (data.data || []);
      
      setFavorites(creatorList.map(transformApiToCreator));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- API Function: Delete Saved Creator ---
  const handleRemoveFavorite = async (creatorId: string) => {
    // Optimistic UI update: remove card immediately
    setFavorites((prev) => prev.filter((c) => c.id !== creatorId));

    try {
     
      const res = await fetchWithAuth(`/api/saved-creators/${creatorId}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error("Failed to remove creator.");
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      // Re-fetch if deletion failed on server
      fetchFavorites();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col font-sans">
      <div className="mb-8 mt-6">
        <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-2 drop-shadow-sm leading-tight">
          Saved Creators
        </h1>
        <p className="text-base text-gray-500 font-light">
          Your curated list of favorite influencers for future campaigns.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading your favorites...</div>
      ) : error ? (
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-sm mb-4">You haven't saved any creators yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-start animate-in fade-in duration-500">
          {favorites.map((creator) => (
            <div key={creator.id} className="relative group w-full max-w-75">
              <CreatorCard creator={creator} />
              
              {/* Unsave / Remove Button overlay */}
              <button
                onClick={() => handleRemoveFavorite(creator.id)}
                className="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove from favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  ); 
}