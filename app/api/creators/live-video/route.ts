import { NextRequest, NextResponse } from "next/server";
import https from "https";

interface VideoPayload {
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

// In-memory cache for fast 0ms subsequent lookups (1 hour TTL)
const videoCache = new Map<string, { data: VideoPayload; expiresAt: number }>();

function cleanHandle(input: string): string {
  if (!input) return "";
  let h = input.trim();
  if (h.includes("instagram.com/")) {
    h = h.split("instagram.com/")[1].split("?")[0].split("/")[0];
  } else if (h.includes("tiktok.com/@")) {
    h = h.split("tiktok.com/@")[1].split("?")[0].split("/")[0];
  }
  return h.toLowerCase().replace("@", "").trim();
}

function httpsGet(urlStr: string, headers: Record<string, string>): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers,
    };
    https
      .get(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 500, data: body }));
      })
      .on("error", (err) => reject(err));
  });
}

async function getInstagramUserPk(handle: string): Promise<string | null> {
  try {
    const res = await httpsGet(`https://www.instagram.com/${handle}/`, {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
    });
    if (res.status !== 200) return null;
    const match = res.data.match(/"id":"(\d+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function fetchInstagramLatestReel(pk: string, handle: string): Promise<VideoPayload | null> {
  const sessionId = process.env.IG_SESSION_ID;
  if (!sessionId) return null;

  try {
    const url = `https://i.instagram.com/api/v1/feed/user/${pk}/`;
    const res = await httpsGet(url, {
      "User-Agent": "Instagram 278.0.0.19.115 (iPhone14,2; iOS 16_5; en_US; scale=3.00; 1170x2532)",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cookie": `sessionid=${sessionId}`,
    });

    if (res.status !== 200) return null;
    const data = JSON.parse(res.data);
    const items = data.items || [];

    // Find first reel / video post
    const videoItem = items.find(
      (item: any) => item.media_type === 2 || (item.video_versions && item.video_versions.length > 0)
    );

    if (!videoItem) return null;

    const code = videoItem.code;
    const directVideoUrl = videoItem.video_versions?.[0]?.url || null;
    const coverUrl = videoItem.image_versions2?.candidates?.[0]?.url || null;
    const viewCount = videoItem.view_count || videoItem.play_count || null;
    const likeCount = videoItem.like_count || null;
    const caption = videoItem.caption?.text || "";

    return {
      platform: "instagram",
      handle,
      code,
      directVideoUrl,
      coverUrl,
      viewCount,
      likeCount,
      caption,
      permalink: `https://www.instagram.com/reel/${code}/`,
      embedUrl: `https://www.instagram.com/reel/${code}/embed`,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawHandle = searchParams.get("handle");
  const platform = (searchParams.get("platform") || "instagram").toLowerCase();

  if (!rawHandle) {
    return NextResponse.json({ error: "Handle parameter is required" }, { status: 400 });
  }

  const handle = cleanHandle(rawHandle);
  const cacheKey = `${platform}:${handle}`;

  // Check in-memory cache (0ms lookup)
  const cached = videoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ ...cached.data, cached: true }, {
      headers: { "X-Cache": "HIT" },
    });
  }

  let videoData: VideoPayload | null = null;

  if (platform === "instagram" || platform === "all") {
    const pk = await getInstagramUserPk(handle);
    if (pk) {
      videoData = await fetchInstagramLatestReel(pk, handle);
    }
  }

  // Fallback: If no direct video or if TikTok requested, return structured profile details
  if (!videoData) {
    videoData = {
      platform: (platform as "instagram" | "tiktok") || "instagram",
      handle,
      directVideoUrl: null,
      coverUrl: null,
      permalink: platform === "tiktok" ? `https://www.tiktok.com/@${handle}` : `https://www.instagram.com/${handle}/`,
      embedUrl: null,
      caption: null,
    };
  }

  // Cache for 1 hour
  videoCache.set(cacheKey, {
    data: videoData,
    expiresAt: Date.now() + 60 * 60 * 1000,
  });

  return NextResponse.json({ ...videoData, cached: false });
}
