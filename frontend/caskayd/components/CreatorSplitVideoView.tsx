"use client";

import React, { useState, useEffect, useRef } from "react";
import CreatorCard, { Creator } from "./CreatorCard";

interface VideoData {
  platform: "instagram" | "tiktok";
  handle: string;
  code?: string;
  directVideoUrl?: string | null;
  coverUrl?: string | null;
  viewCount?: number | null;
  likeCount?: number | null;
  caption?: string | null;
  permalink?: string | null;
  embedUrl?: string | null;
}

interface CreatorSplitVideoViewProps {
  creators: Creator[];
  initialIndex?: number;
}

export default function CreatorSplitVideoView({
  creators,
  initialIndex = 0,
}: CreatorSplitVideoViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeCreator = creators[currentIndex] || creators[0];

  // Helper to get primary handle from Creator.stats
  const getActiveHandle = (creator: Creator) => {
    if (creator.stats?.instagram?.handle) {
      return { handle: creator.stats.instagram.handle, platform: "instagram" };
    }
    if (creator.stats?.tiktok?.handle) {
      return { handle: creator.stats.tiktok.handle, platform: "tiktok" };
    }
    return { handle: creator.name.toLowerCase().replace(/\s+/g, ""), platform: "instagram" };
  };

  // Keyboard navigation (Arrow Up / Down, J / K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setCurrentIndex((prev) => (prev < creators.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : creators.length - 1));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [creators.length]);

  // Fetch live video on active creator change
  useEffect(() => {
    if (!activeCreator) return;
    const { handle, platform } = getActiveHandle(activeCreator);

    let isMounted = true;
    setIsLoadingVideo(true);
    setVideoData(null);

    fetch(`/api/creators/live-video?handle=${encodeURIComponent(handle)}&platform=${platform}`)
      .then((res) => res.json())
      .then((data: VideoData) => {
        if (!isMounted) return;
        setVideoData(data);
        setIsLoadingVideo(false);
      })
      .catch((err) => {
        console.error("Failed to load video:", err);
        if (isMounted) setIsLoadingVideo(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentIndex, activeCreator]);

  // Auto-play when video changes
  useEffect(() => {
    if (videoRef.current && videoData?.directVideoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [videoData?.directVideoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  if (!activeCreator) return null;

  return (
    <div className="w-full max-w-6xl mx-auto py-4 animate-in fade-in duration-300">
      {/* Top Quick Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-ping" />
            LIVE SPLIT VIEW
          </span>
          <span className="text-xs font-semibold text-gray-500">
            Creator {currentIndex + 1} of {creators.length}
          </span>
        </div>

        {/* Previous / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : creators.length - 1))}
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>▲</span> Prev
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev < creators.length - 1 ? prev + 1 : 0))}
            className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Next <span>▼</span>
          </button>
          <span className="text-[11px] text-gray-400 ml-2 hidden sm:inline">
            (Use ↑ / ↓ arrow keys)
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Creator Details & Quick Strip */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="w-full max-w-[380px] mx-auto lg:mx-0">
            <CreatorCard creator={activeCreator} />
          </div>

          {/* Quick Creator Thumbnails Strip */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Search Results Strip ({creators.length})
            </h4>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {creators.map((c, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#ff6b35] scale-105 shadow-md shadow-[#ff6b35]/20 ring-2 ring-[#ff6b35]/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={c.imageUrl || "/placeholder.jpg"}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Studio 9:16 Video Player Frame */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-900 group">
            {/* Ambient Background Glow */}
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125"
              style={{ backgroundImage: `url(${activeCreator.imageUrl || videoData?.coverUrl || ''})` }}
            />

            {/* Video Content */}
            {isLoadingVideo && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="w-10 h-10 border-3 border-[#ff6b35] border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-semibold text-white/80 tracking-wide">
                  Loading Reel for @{getActiveHandle(activeCreator).handle}...
                </span>
              </div>
            )}

            {!isLoadingVideo && videoData?.directVideoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoData.directVideoUrl}
                  poster={videoData.coverUrl || activeCreator.imageUrl}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  onClick={togglePlay}
                  className="relative z-10 w-full h-full object-cover cursor-pointer"
                />

                {/* Floating Sound Toggle Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <span>{isMuted ? "🔇" : "🔊"}</span>
                  <span>{isMuted ? "Sound Off" : "Sound On"}</span>
                </button>

                {/* Bottom Overlay with Stats & Caption */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-5 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col gap-2">
                  {/* View & Like Metrics */}
                  <div className="flex items-center gap-3">
                    {videoData.viewCount && (
                      <span className="text-[11px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                        ▶ {(videoData.viewCount).toLocaleString()} views
                      </span>
                    )}
                    {videoData.likeCount && (
                      <span className="text-[11px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                        ❤️ {(videoData.likeCount).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  {videoData.caption && (
                    <p className="text-xs text-white/90 line-clamp-2 leading-relaxed drop-shadow-sm">
                      {videoData.caption}
                    </p>
                  )}

                  {/* Direct Link */}
                  {videoData.permalink && (
                    <a
                      href={videoData.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-[11px] font-bold text-[#ff6b35] hover:underline flex items-center gap-1"
                    >
                      Watch on {videoData.platform === "tiktok" ? "TikTok" : "Instagram"} ↗
                    </a>
                  )}
                </div>
              </>
            ) : !isLoadingVideo ? (
              /* Fallback State */
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gray-950">
                <img
                  src={activeCreator.imageUrl || "/placeholder.jpg"}
                  alt={activeCreator.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#ff6b35] shadow-lg mb-4"
                />
                <h3 className="text-base font-bold text-white mb-1">
                  {activeCreator.name}
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  @{getActiveHandle(activeCreator).handle}
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-xs mb-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Direct public reel stream not currently open or account is waiting for content refresh.
                  </p>
                </div>
                <a
                  href={`https://www.instagram.com/${getActiveHandle(activeCreator).handle}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#ff6b35] hover:bg-[#e05a28] text-white text-xs font-bold shadow-lg transition-transform active:scale-95"
                >
                  View Profile & Reels ↗
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
