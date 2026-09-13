import { NextResponse } from "next/server";
import { z } from "zod";
import type { MusicSuggestion } from "@/lib/autocomplete";

const catalog = z.object({ results: z.array(z.object({
  artistName: z.string().max(250), trackName: z.string().max(250).optional(),
})) });

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 80) return NextResponse.json({ suggestions: [] });
  try {
    const url = new URL("https://itunes.apple.com/search");
    url.search = new URLSearchParams({ term: q, media: "music", entity: "song", limit: "16", country: "US" }).toString();
    // Public, key-free metadata search. Cache identical queries to conserve free quota.
    const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Catalog unavailable");
    const { results } = catalog.parse(await response.json());
    const artists = [...new Set(results.map(item => item.artistName))]
      .sort((a, b) => Number(b.toLowerCase() === q.toLowerCase()) - Number(a.toLowerCase() === q.toLowerCase()) || a.length - b.length)
      .slice(0, 3);
    const songs = [...new Set(results.filter(item => item.trackName).map(item => `${item.artistName} — ${item.trackName}`))].slice(0, 5);
    const suggestions: MusicSuggestion[] = [
      ...artists.map(label => ({ label, kind: "artist" as const })),
      ...songs.map(label => ({ label, kind: "song" as const })),
    ];
    return NextResponse.json({ suggestions }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" } });
  } catch {
    // Suggestions are optional: provider failures never block manually entered picks.
    return NextResponse.json({ suggestions: [], unavailable: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
