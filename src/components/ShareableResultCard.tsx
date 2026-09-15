"use client";
import { forwardRef } from "react";
import type { SessionView } from "@/lib/schema";

const ShareableResultCard = forwardRef<HTMLDivElement, { session: SessionView }>(function ShareableResultCard({ session }, ref) {
  const result = session.resultJson!;
  const hue = Math.round(result.compatibilityScore * 0.48);
  const quote = result.verdict.length > 150 ? result.verdict.slice(0, 147).trimEnd() + "…" : result.verdict;
  return <div ref={ref} className="visual-vibe-card" style={{ background: `linear-gradient(145deg, #211d30, hsl(${hue}, 48%, 23%))` }}>
    <div className="visual-card-top"><span>r we vibing?</span><span>THE SHARED MIX ✦</span></div>
    <div className="visual-match"><span>{session.personAName}</span><b>✧<br />×</b><span>{session.personBName}</span></div>
    <div className="visual-score" style={{ color: `hsl(${hue}, 95%, 73%)` }}><strong>{result.compatibilityScore}</strong><span>%<small>IN SYNC</small></span></div>
    <div className="visual-records" aria-hidden="true"><i /><i /><i /></div>
    <div className="thumbnail-collage">{(session.playlist || []).slice(0, 3).map(track => (
      // Same-origin proxy prevents cross-origin images from breaking PNG export.
      // eslint-disable-next-line @next/next/no-img-element
      <img key={track.videoId} src={`/api/playlist-thumbnail/${track.videoId}`} alt="" width={180} height={135} onError={event => { event.currentTarget.style.visibility = "hidden"; }} />
    ))}</div>
    <blockquote>“{quote}”</blockquote><div className="visual-genres">{Array.from(new Set([...result.personA.genres, ...result.personB.genres])).slice(0, 4).join("  ·  ")}</div>
    <div className="visual-card-bottom"><span>TWO TASTES. ONE FREQUENCY.</span><span>are-we-vibing.vercel.app</span></div>
  </div>;
});
export default ShareableResultCard;
