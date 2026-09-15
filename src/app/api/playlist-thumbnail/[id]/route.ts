import { NextResponse } from "next/server";
// Same-origin images keep html-to-image exports readable without arbitrary URL proxying.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return new NextResponse(null, { status: 400 });
  try {
    const image = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!image.ok) return new NextResponse(null, { status: 404 });
    return new NextResponse(await image.arrayBuffer(), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" } });
  } catch { return new NextResponse(null, { status: 503 }); }
}
