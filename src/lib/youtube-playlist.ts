import type { PlaylistTrack } from "./schema";

/** Ten fixed-host, server-side searches at most. Failure never discards a compatibility result. */
export async function findSharedPlaylist(recommendations: string[]): Promise<PlaylistTrack[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const matches = await Promise.all(recommendations.slice(0, 10).map(async query => {
    try {
      const params = new URLSearchParams({ key, part: "snippet", type: "video", q: query,
        videoEmbeddable: "true", videoSyndicated: "true", maxResults: "1" });
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { signal: AbortSignal.timeout(7000) });
      if (!response.ok) return null;
      const item = (await response.json()).items?.[0];
      const videoId = item?.id?.videoId;
      if (typeof videoId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
      return { videoId, title: String(item.snippet?.title || query).slice(0, 300),
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` };
    } catch { return null; }
  }));
  const seen = new Set<string>();
  return matches.filter((track): track is PlaylistTrack => {
    if (!track || seen.has(track.videoId)) return false;
    seen.add(track.videoId); return true;
  });
}
