"use client";
import { T } from "@/components/language-provider";

import { forwardRef, type RefObject } from "react";
import type { SessionView } from "@/lib/schema";
import { trophyArt } from "@/lib/trophy-art";
import { AudioLines, Music2 } from "lucide-react";

export const coverSize = { width: 480, height: 854 };
/** Fixed story-format artwork; dynamic text stays sharp at export resolution. */
const ShareableResultCard = forwardRef<HTMLDivElement, { session: SessionView; scoreRef?: RefObject<HTMLSpanElement>; animated?: boolean }>(function ShareableResultCard({ session, scoreRef, animated = false }, ref) {
  const result = session.resultJson!;
  const quote = result.verdict.length > 155 ? result.verdict.slice(0, 152).trimEnd() + "…" : result.verdict;
  const nameSize = (name: string | null) => (name?.length ?? 0) > 28 ? 11 : (name?.length ?? 0) > 20 ? 12 : 14;
  return <div ref={ref} className={`export-card ${animated ? "cover-animated" : ""}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="cover-universe" src="/art/music-universe.webp" alt="" width={480} height={854} />
    <div className="cover-stars" aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index} style={{left:`${8+((index*29)%84)}%`,top:`${15+((index*17)%54)}%`,animationDelay:`${index*-.7}s`}} />)}</div>
    <div className="cover-signals" aria-hidden="true">{Array.from({length:3},(_,index)=><Music2 key={index} size={18} style={{animationDelay:`${index*-2.5}s`}} />)}</div>
    <div className="cover-moon" aria-hidden="true" />
    <svg className="cover-flow" viewBox="0 0 480 854" aria-hidden="true"><path d="M38 326 C190 300 152 473 344 426 S450 486 468 539" /><path d="M16 345 C180 317 154 489 344 442 S448 500 485 555" /></svg>
    <div className="cover-shooting-star" aria-hidden="true" />
    <div className="export-masthead"><strong><i aria-hidden="true"><AudioLines size={16} /></i>r we vibing?</strong><span><T text={"YOUR SHARED MIX"} /></span></div>
    <div className="export-match"><div><b>A</b><span style={{fontSize:nameSize(session.personAName)}}>{session.personAName}</span></div><i>+</i><div><b>B</b><span style={{fontSize:nameSize(session.personBName)}}>{session.personBName}</span></div></div>
    <div className={`export-score ${result.compatibilityScore === 100 ? "score-three" : ""}`}><strong><span ref={scoreRef}>{result.compatibilityScore}</span><small>%</small></strong><span><T text={"music compatibility"} /></span></div>
    <blockquote>“{quote}”</blockquote>
    <div className="export-awards">{result.superlatives.slice(0, 2).map((award, index) => <div key={index}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={trophyArt(award.title).src} alt="" width={62} height={74} />
      <div><strong>{award.title}</strong><span style={{fontSize:(award.person === "A" ? session.personAName.length : session.personBName?.length ?? 0) > 24 ? 9 : 10}}>{award.person === "A" ? session.personAName : session.personBName}</span></div>
    </div>)}</div>
    <div className="export-footer"><span><T text={"A playful AI interpretation"} /></span><strong>are-we-vibing.vercel.app</strong></div>
  </div>;
});
export default ShareableResultCard;
