import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { listYouTubePlaylists, youTubeAccessToken } from "@/lib/youtube-account";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    if (!await currentUser()) return NextResponse.json({ status: "signed-out", playlists: [] }, { headers });
    const token = await youTubeAccessToken();
    if (!token) return NextResponse.json({ status: "connect", playlists: [] }, { headers });
    const pageToken = new URL(request.url).searchParams.get("pageToken") || undefined;
    if (pageToken && !/^[\w=-]{1,500}$/.test(pageToken)) return NextResponse.json({ status: "unavailable", playlists: [] }, { headers });
    return NextResponse.json({ status: "connected", ...await listYouTubePlaylists(token, pageToken) }, { headers });
  } catch (error) {
    return NextResponse.json({ status: error instanceof Error && "status" in error && error.status === 401 ? "connect" : "unavailable", playlists: [] }, { headers });
  }
}
