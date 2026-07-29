// app/(dashboard)/search/page.tsx
"use client";

import React, { useState } from "react";
import CreatorCard, { Creator, PlatformStats } from "../../../components/CreatorCard";
import { fetchWithAuth } from "@/lib/api";

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm w-full max-w-[300px] animate-pulse">
    <div className="w-full h-56 bg-gray-200"></div>
    <div className="p-4 flex flex-col gap-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="mt-4 h-10 bg-gray-200 rounded-xl w-full"></div>
    </div>
  </div>
);

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Creator[]>([]);
  const [error, setError] = useState<string | null>(null);

  

  // Helper function to format large numbers (e.g., 15000 -> 15k)
  const formatFollowers = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

// Helper to map backend API response to our UI CreatorCard interface
  const transformApiToCreator = (apiItem: any): Creator => {
    // Extract the creator object from the search API's ranking wrapper
    const creatorData = apiItem.creator || apiItem;

    const stats: any = {};
    let isVerified = false;

    // Loop through the platforms array to build the stats object
    if (creatorData.platforms && Array.isArray(creatorData.platforms)) {
      creatorData.platforms.forEach((p: any) => {
        const platformName = (p.platform || "instagram").toLowerCase() as "instagram" | "tiktok" | "twitter";
        
        if (p.verified) isVerified = true;

        stats[platformName] = {
          followers: formatFollowers(p.followers || 0),
          handle: p.handle || "N/A", // Replaced price/engRate with handle
        };
      });
    }

    // Safely construct the location string avoiding ", " if a value is missing
    const locationParts = [];
    if (creatorData.state) locationParts.push(creatorData.state);
    if (creatorData.country) locationParts.push(creatorData.country);
    const locationString = locationParts.length > 0 ? locationParts.join(", ") : "N/A";

    const fallbackImage = `https://i.pravatar.cc/400?u=${creatorData.id || "default"}`;

    return {
      id: creatorData.id || creatorData._id,
      name: creatorData.name || "Unknown Creator",
      niche: creatorData.primaryNiche && creatorData.primaryNiche !== "Unspecified" 
        ? creatorData.primaryNiche 
        : "Creator",
      location: locationString,
      gender: creatorData.gender || "Unspecified", // Added gender mapping
      imageUrl: creatorData.profileImage || fallbackImage,
      verified: isVerified,
      stats: Object.keys(stats).length > 0 
        ? stats 
        : { instagram: { followers: "0", handle: "N/A" } },
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setResults([]);
    setError(null);

    // Smart Filter Check
    const keywordRegex = /(male|female|men|women|\d+k|\d+m|thousand|million|instagram|tiktok|twitter|ig|x)/i;
    setShowFilters(!keywordRegex.test(query));

    

    try {
      // Build the URL with the query parameter
      const url = new URL("/api/search", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
      url.searchParams.append("query", query);

      const res = await fetchWithAuth(url.toString());

      if (!res.ok) {
        throw new Error("Failed to fetch creators.");
      }

      const data = await res.json();
      console.log("API Response:", data); // Debugging line to inspect the API response
      
      // Assuming the API returns an array directly, or an object like { data: [...] }
      const creatorList = Array.isArray(data) ? data : (data.data || []);
      
      const formattedResults = creatorList.map(transformApiToCreator);
      setResults(formattedResults);

    } catch (err: any) {
      setError(err.message || "An error occurred while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setHasSearched(false);
    setShowFilters(false);
    setResults([]);
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center font-sans">
      
      <div className="w-full max-w-2xl text-center mb-10 mt-6">
        <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-6 drop-shadow-sm leading-tight">
          Find the perfect creator
        </h1>
        
        <form onSubmit={handleSearch} className="relative flex items-center w-full shadow-sm rounded-full group">
          <svg className="absolute left-5 w-5 h-5 text-gray-400 group-focus-within:text-[#ff6b35] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. fashion creators in lagos under 100k"
            className="w-full pl-12 pr-40 py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-gray-900 shadow-sm text-base"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-28 text-gray-400 hover:text-gray-600 transition-colors p-2"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 bg-black text-white hover:bg-gray-800 font-semibold px-6 rounded-full transition-colors cursor-pointer text-sm shadow-sm disabled:opacity-50"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </form>

        {showFilters && (
          <div className="mt-6 flex flex-nowrap overflow-x-auto pb-2 items-center justify-center md:justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 hide-scrollbar">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2 whitespace-nowrap">Quick Filters:</span>
            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff6b35] cursor-pointer whitespace-nowrap shadow-sm">
              <option>Any Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff6b35] cursor-pointer whitespace-nowrap shadow-sm">
              <option>Followers (Any)</option>
              <option>10k - 50k</option>
              <option>50k - 100k</option>
              <option>100k+</option>
            </select>
            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ff6b35] cursor-pointer whitespace-nowrap shadow-sm">
              <option>All Platforms</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Twitter / X</option>
            </select>
          </div>
        )}

        {/* Display backend errors if they occur */}
        {error && (
          <div className="mt-4 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {hasSearched && !error && (
        <div className="w-full">
          {isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center animate-in fade-in duration-500">
              {results.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          )}

          {!isSearching && results.length === 0 && (
            <div className="text-center py-16 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 3H7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No creators found</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                We couldn't find any creators matching "{query}". Try adjusting your filters or using broader keywords.
              </p>
              <button 
                onClick={clearSearch}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold px-5 py-2 rounded-xl transition-colors text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}