"use client";
import { forwardRef } from "react";
import type { SessionView } from "@/lib/schema";

/** Fixed 480 × 600 artwork: export stays identical on phones and desktop. */
const ShareableResultCard = forwardRef<HTMLDivElement, { session: SessionView }>(function ShareableResultCard({ session }, ref) {
  const result = session.resultJson!;
  const hue = Math.round(result.compatibilityScore * 0.48);
  const quote = result.verdict.length > 145 ? result.verdict.slice(0, 142).trimEnd() + "…" : result.verdict;
  return <div ref={ref} className="export-card">
    <div className="export-masthead"><strong>r we vibing?</strong><span>THE CHEMISTRY ISSUE / 01</span></div>
    <div className="export-score-zone" style={{ background: `linear-gradient(125deg, hsl(${hue}, 85%, 72%), #f5dbae)` }}>
      <div className="export-kicker">TWO TASTES. ONE FREQUENCY.</div>
      <div className="export-score"><strong>{result.compatibilityScore}</strong><span>%<small>IN SYNC</small></span></div>
      <div className="export-grooves" aria-hidden="true"><i /><i /><i /></div>
      <div className="export-match"><span>{session.personAName}</span><b>×</b><span>{session.personBName}</span></div>
    </div>
    <div className="export-bottom">
      <div className="export-collage" aria-hidden="true">
        {(session.playlist || []).slice(0, 3).map(track => (
          // Same-origin image URLs keep canvas exports free of CORS failures.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={track.videoId} src={`/api/playlist-thumbnail/${track.videoId}`} alt="" width={120} height={80} onError={event => { event.currentTarget.style.visibility = "hidden"; }} />
        ))}
        {!session.playlist?.length && <span className="export-no-art">♫ YOUR SHARED MIX ♫</span>}
      </div>
      <blockquote>“{quote}”</blockquote>
      <div className="export-awards">{result.superlatives.slice(0, 2).map((award, index) => (
        <div key={index}><span>{award.person === "A" ? session.personAName : session.personBName}</span><strong>{award.title}</strong></div>
      ))}</div>
      <div className="export-footer"><span>GOOD MUSIC. BETTER COMPANY.</span><strong>are-we-vibing.vercel.app ↗</strong></div>
    </div>
  </div>;
});
export default ShareableResultCard;
