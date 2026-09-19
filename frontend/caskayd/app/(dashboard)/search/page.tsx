// app/(dashboard)/search/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import CreatorCard, { Creator, PlatformStats } from "../../../components/CreatorCard";
import CreatorSplitVideoView from "../../../components/CreatorSplitVideoView";
import { fetchWithAuth } from "@/lib/api";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

// Extend the Creator interface locally to hold the raw state strictly for filtering
type FilterableCreator = Creator & { rawState?: string };

// --- Skeleton Loader ---
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

// --- Custom Filter Dropdown UI ---
function CustomFilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
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

  return (
    <div ref={dropdownRef} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 md:px-4 py-2.5 hover:border-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] cursor-pointer md:min-w-[130px]"
      >
        <span className="truncate">{value}</span>
        <span className="text-[10px] opacity-70 ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[150px] bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs transition-colors cursor-pointer ${
                value === opt
                  ? "bg-gray-50 text-[#ff6b35] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#ff6b35] font-medium"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Searchable Filter Dropdown UI ---
function SearchableFilterDropdown({
  value,
  options,
  onChange,
  defaultOption,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  defaultOption: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm("");
        }}
        className="w-full flex items-center justify-between bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 md:px-4 py-2.5 hover:border-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] cursor-pointer md:min-w-[130px]"
      >
        <span className="truncate">{value}</span>
        <span className="text-[10px] opacity-70 ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-[200px] bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(defaultOption);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs transition-colors cursor-pointer ${
                value === defaultOption
                  ? "bg-gray-50 text-[#ff6b35] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#ff6b35] font-medium"
              }`}
            >
              {defaultOption}
            </button>
            {filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-xs transition-colors cursor-pointer ${
                  value === opt
                    ? "bg-gray-50 text-[#ff6b35] font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#ff6b35] font-medium"
                }`}
              >
                {opt}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-400">No states found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Raw API results & Display results
  const [allResults, setAllResults] = useState<FilterableCreator[]>([]);
  const [results, setResults] = useState<FilterableCreator[]>([]);

  // Filter States
  const [genderFilter, setGenderFilter] = useState("Any Gender");
  const [followerFilter, setFollowerFilter] = useState("Followers (Any)");
  const [platformFilter, setPlatformFilter] = useState("All Platforms");
  const [stateFilter, setStateFilter] = useState("All States");
  const [viewMode, setViewMode] = useState<"grid" | "split">("grid");

  // --- LIVE CLIENT-SIDE FILTERING ENGINE ---
  useEffect(() => {
    let filtered = [...allResults];

    // 1. Filter by Gender
    if (genderFilter !== "Any Gender") {
      filtered = filtered.filter((c) => c.gender?.toLowerCase() === genderFilter.toLowerCase());
    }

    // 2. Filter by Platform
    if (platformFilter !== "All Platforms") {
      const platformKey = platformFilter.toLowerCase();
      filtered = filtered.filter((c) => c.stats && c.stats[platformKey as keyof typeof c.stats]);
    }

    // 3. Filter by Followers
    if (followerFilter !== "Followers (Any)") {
      filtered = filtered.filter((c) => {
        const platformsToCheck = platformFilter !== "All Platforms"
            ? [platformFilter.toLowerCase()]
            : Object.keys(c.stats);

        const parseFollowers = (str: string) => {
          if (!str || str === "N/A") return 0;
          const upper = str.toUpperCase();
          if (upper.endsWith("M")) return parseFloat(upper) * 1000000;
          if (upper.endsWith("K")) return parseFloat(upper) * 1000;
          return parseFloat(upper);
        };

        const maxFollowers = Math.max(
          ...platformsToCheck.map((p) =>
            parseFollowers(c.stats[p as keyof typeof c.stats]?.followers || "0")
          )
        );

        if (followerFilter === "10k - 50k") return maxFollowers >= 10000 && maxFollowers <= 50000;
        if (followerFilter === "50k - 100k") return maxFollowers > 50000 && maxFollowers <= 100000;
        if (followerFilter === "100k+") return maxFollowers > 100000;
        return true;
      });
    }

    // 4. Filter by State
    if (stateFilter !== "All States") {
      filtered = filtered.filter((c) => 
        c.rawState?.toLowerCase() === stateFilter.toLowerCase() || 
        c.location.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }

    setResults(filtered);
  }, [allResults, genderFilter, platformFilter, followerFilter, stateFilter]);

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const transformApiToCreator = (apiItem: any): FilterableCreator => {
    const creatorData = apiItem.creator || apiItem;
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
    const locationString = locationParts.length > 0 ? locationParts.join(", ") : "N/A";
    const fallbackImage = `https://i.pravatar.cc/400?u=${creatorData.id || "default"}`;

    return {
      id: creatorData.id || creatorData._id,
      name: creatorData.name || "Unknown Creator",
      niche: creatorData.primaryNiche && creatorData.primaryNiche !== "Unspecified" 
        ? creatorData.primaryNiche 
        : "Creator",
      location: locationString,
      rawState: creatorData.state, 
      gender: creatorData.gender || "Unspecified",
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
    setAllResults([]);
    setResults([]);
    setError(null);

    try {
      const url = new URL("/api/search", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
      url.searchParams.append("query", query);

      const res = await fetchWithAuth(url.toString(), {
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
        
        throw new Error(backendMsg);
      }

      const data = await res.json();
      const creatorList = Array.isArray(data) ? data : (data.data || []);
      const formattedResults = creatorList.map(transformApiToCreator);
      
      setAllResults(formattedResults);
    } catch (err: any) {
      console.error("Search API Error:", err);
      setError(`Backend Error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setHasSearched(false);
    setAllResults([]);
    setResults([]);
    setError(null);
    setGenderFilter("Any Gender");
    setFollowerFilter("Followers (Any)");
    setPlatformFilter("All Platforms");
    setStateFilter("All States");
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center font-sans pb-10">
      
      <div className="w-full max-w-2xl text-center mb-6 mt-6 relative z-20">
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
              className="absolute right-28 text-gray-400 hover:text-gray-600 transition-colors p-2 cursor-pointer"
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

        {error && (
          <div className="mt-4 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* ===== STATIC FILTERS BAR ===== */}
      {hasSearched && !error && (
        <div className="w-full max-w-4xl mx-auto mt-2 mb-10 pb-6 border-b border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300 relative z-40">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 px-4 md:px-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center md:text-left w-full md:w-auto mb-1 md:mb-0">
              Refine By:
            </span>
            
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
              <SearchableFilterDropdown
                value={stateFilter}
                options={NIGERIAN_STATES}
                onChange={setStateFilter}
                defaultOption="All States"
              />

              <CustomFilterDropdown 
                value={genderFilter} 
                options={["Any Gender", "Male", "Female"]} 
                onChange={setGenderFilter} 
              />

              <CustomFilterDropdown 
                value={followerFilter} 
                options={["Followers (Any)", "10k - 50k", "50k - 100k", "100k+"]} 
                onChange={setFollowerFilter} 
              />

              <CustomFilterDropdown 
                value={platformFilter} 
                options={["All Platforms", "Instagram", "TikTok"]} 
                onChange={setPlatformFilter} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== EMPTY STATE CARTOON GRAPHIC ===== */}
      {!hasSearched && (
        <div className="mt-6 flex flex-col items-center justify-center animate-in fade-in duration-700 opacity-90 relative z-10">
          <div className="relative w-48 h-48 mb-6 drop-shadow-sm">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M165.7 141.5C148.6 166.4 117.8 178.6 88 176.5C58.2 174.4 29.5 158 17.5 130.3C5.5 102.6 10.2 71.3 27.6 48.7C45 26.1 75.1 12.2 105.1 11.5C135.1 10.8 165 23.3 180.1 48.5C195.2 73.7 195.5 111.6 165.7 141.5Z" fill="#FFF5F0" />
              <rect x="70" y="90" width="60" height="70" rx="20" fill="#FFE2D6" />
              <circle cx="100" cy="70" r="35" fill="#FFE2D6" />
              <path d="M65 70 Q100 40 135 70" fill="#FF6B35" />
              <circle cx="88" cy="65" r="4" fill="#1F2937" />
              <circle cx="112" cy="65" r="4" fill="#1F2937" />
              <path d="M92 78 Q100 85 108 78" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M125 100 Q145 110 155 90" stroke="#FFE2D6" strokeWidth="12" strokeLinecap="round" fill="none" />
              <circle cx="165" cy="75" r="22" stroke="#FF6B35" strokeWidth="8" fill="white" />
              <path d="M150 90 L135 105" stroke="#FF6B35" strokeWidth="8" strokeLinecap="round" />
              <circle cx="40" cy="40" r="4" fill="#FFB094" />
              <circle cx="160" cy="150" r="6" fill="#FFB094" />
              <circle cx="30" cy="130" r="3" fill="#FFB094" />
            </svg>
          </div>
          <h3 className="text-2xl font-serif text-gray-800 font-medium mb-3 tracking-tight">Ready to discover?</h3>
          <p className="text-base text-gray-400 max-w-sm text-center leading-relaxed">
            Search by niche, location, platform, or follower count to find exactly who you need for your next campaign.
          </p>
        </div>
      )}

      {/* ===== SEARCH RESULTS ===== */}
      {hasSearched && !error && (
        <div className="w-full relative z-10">
          {isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <>
              {/* View Mode Switcher Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-900">{results.length}</span> creators
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    ⊞ Grid View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("split")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "split" ? "bg-white text-[#ff6b35] shadow-sm font-bold" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    <span>🎬</span> Split Video View
                  </button>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center animate-in fade-in duration-500">
                  {results.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              ) : (
                <CreatorSplitVideoView creators={results} />
              )}
            </>
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
                We couldn't find any creators matching those filters. Try clearing them to see all results for "{query}".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}