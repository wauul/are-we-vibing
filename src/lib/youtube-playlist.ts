import type { PlaylistTrack } from "./schema";

export function decodeVideoTitle(value: string): string {
  return value.replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code: string) => {
    const point = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code);
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
  }).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
const words = (text: string) => text.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").match(/[\p{L}\p{N}]+/gu) || [];
export function isSongMatch(query: string, title: string, channel: string): boolean {
  const [artist, ...songParts] = query.split(/\s+[—–-]\s+/);
  const titleWords = new Set(words(title));
  const artistWords = new Set(words(title + " " + channel));
  const coverage = (text: string, candidates: Set<string>) => {
    const tokens = words(text); return tokens.length > 0 && tokens.filter(token => candidates.has(token)).length / tokens.length >= 0.6;
  };
  return songParts.length ? coverage(songParts.join(" "), titleWords) && coverage(artist, artistWords) : coverage(query, artistWords);
}

/** Ten fixed-host, server-side searches at most. Failure never discards a compatibility result. */
export async function findSharedPlaylist(recommendations: string[]): Promise<PlaylistTrack[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const matches = await Promise.all(recommendations.slice(0, 10).map(async query => {
    try {
      const params = new URLSearchParams({ key, part: "snippet", type: "video", q: query,
        videoEmbeddable: "true", videoSyndicated: "true", videoCategoryId: "10", maxResults: "3" });
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { signal: AbortSignal.timeout(7000) });
      if (!response.ok) return null;
      const items = (await response.json()).items;
      // A weak search result must not turn an invented song into an unrelated video.
      const item = Array.isArray(items) ? items.find(item => isSongMatch(query, decodeVideoTitle(String(item.snippet?.title || "")), String(item.snippet?.channelTitle || ""))) : null;
      const videoId = item?.id?.videoId;
      if (typeof videoId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
      return { videoId, title: decodeVideoTitle(String(item.snippet?.title || query)).slice(0, 300),
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` };
    } catch { return null; }
  }));
  const seen = new Set<string>();
  return matches.filter((track): track is PlaylistTrack => {
    if (!track || seen.has(track.videoId)) return false;
    seen.add(track.videoId); return true;
  });
}
