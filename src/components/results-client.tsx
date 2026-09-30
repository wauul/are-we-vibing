"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ArrowUpRight, Check, Minus } from "lucide-react";
import type { SessionView } from "@/lib/schema";
import { api } from "@/lib/client-api";
import ShareLink from "./share-link";
import ShareableResultCard, { coverSize } from "./ShareableResultCard";
import CoverPreview from "./cover-preview";
import { TrophyArt } from "./music-art";
import ListenTogether from "./listen-together";
import { Feedback, Side } from "./ui";
import { Capacitor } from "@capacitor/core";
import ResultsLoading from "./results-loading";
const badges = { MANUAL: "Personal picks", SPOTIFY: "Spotify", YOUTUBE: "YouTube playlist" };

export default function ResultsClient({ id }: { id: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [session, setSession] = useState<SessionView | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const score = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let cancelled = false;
    api<SessionView>(`/api/sessions/${id}`).then(s => {
      if (cancelled) return;
      if (!s.resultJson) { router.replace(`/session/${id}`); return; }
      setSession(s);
    }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [id, router]);
  useEffect(() => {
    if (!session?.resultJson || !score.current) return;
    const target = session.resultJson.compatibilityScore;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame: number; let cancelled = false;
    const start = performance.now();
    function tick(t: number) {
      const progress = Math.min((t - start) / 900, 1);
      if (score.current) score.current.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else if (target > 80) void import("canvas-confetti").then(({ default: confetti }) => {
        if (!cancelled) void confetti({ particleCount:60, spread:65, origin:{ y:.6 }, colors:["#ed642f","#62354b","#edc9d7"], disableForReducedMotion:true });
      });
    }
    frame = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [session]);
  async function download() {
    if (!card.current || saving) return;
    setSaving(true); setNotice(""); setSaveFailed(false);
    try {
      await Promise.all(Array.from(card.current.querySelectorAll("img")).map(img => img.decode().catch(() => {})));
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const url = await toPng(card.current, { ...coverSize, pixelRatio:2, backgroundColor:"#2a202c", imagePlaceholder:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=" });
      if (Capacitor.isNativePlatform()) { const { saveNativeCard } = await import("@/lib/native-card"); await saveNativeCard(url); }
      else { const a = document.createElement("a"); a.download="r-we-vibing.png"; a.href=url; document.body.appendChild(a); a.click(); a.remove(); }
      setNotice(Capacitor.isNativePlatform() ? "Saved to Gallery in Pictures / Are We Vibing." : "Your vibe card download has started.");
    } catch { setSaveFailed(true); setNotice("The card couldn’t be saved. Try again or copy your result link."); }
    finally { setSaving(false); }
  }
  if (!session?.resultJson) return error ? <main id="content" className="flow-shell"><h1><T text={"We couldn’t open your result"} /></h1><Feedback tone="error">{error}</Feedback><div className="action-row"><Link href="/friends" className="button"><T text={"Sign in"} /></Link><Link href="/session/new" className="button outline-button"><T text={"New session"} /></Link></div></main> : <ResultsLoading />;
  const r=session.resultJson;
  const genres=Array.from(new Set([...r.personA.genres,...r.personB.genres].map(g => g.toLowerCase())));
  return <main id="content" className="results-shell">
    <div className="result-heading"><h1><T text={"Here’s your shared mix"} /></h1><p>{session.personAName} + {session.personBName}<T text={". Two tastes, a little common ground."} /></p></div>
    <section className="result-reveal" aria-label={t("Your compatibility result")}>
      <div className="result-cover-side"><CoverPreview session={session} scoreRef={score} /><div className="result-actions"><button className="button" onClick={download} disabled={saving}><Download size={17} aria-hidden="true" />{saving ? t("Saving card…") : t("Save vibe card")}</button><ShareLink path={`/results/${id}`} text={t("{0} and {1} got {2}% on R We Vibing. See our shared mix.", {0:session.personAName,1:session.personBName,2:r.compatibilityScore})} compact /></div></div>
      <div className="result-details-side"><p className="result-score-text">{r.compatibilityScore}<T text={"% music compatibility ·"} /> {r.compatibilityScore>80 ? t("A lot in common") : r.compatibilityScore>=50 ? t("A promising overlap") : t("Different tastes, new discoveries")}</p><h2>{r.verdict}</h2><p className="micro"><T text={"A playful AI interpretation"} /></p>
      <div className="person-grid">{[{ side:"A" as const,name:session.personAName,type:session.personAInputType,data:r.personA },{ side:"B" as const,name:session.personBName,type:session.personBInputType!,data:r.personB }].map(p => <article key={p.side} className="person-card"><div className="person-top"><Side side={p.side} /><div><h3>{p.name}</h3><small>{t(badges[p.type])}</small></div></div><p>{p.data.vibeSummary}</p><div className="genre-tags">{p.data.genres.map(genre => <span key={genre}>{genre}</span>)}</div></article>)}</div>
    </div></section>
    {notice && <Feedback tone={saveFailed ? "error" : "success"}>{notice}</Feedback>}
    <div className="export-stage" aria-hidden="true"><ShareableResultCard ref={card} session={session} /></div>
    <section className="trophies-section" aria-labelledby="trophies-title"><h2 id="trophies-title"><T text={"Your music trophies"} /></h2><div className="awards">{r.superlatives.map((award,index) => <article key={index}><TrophyArt title={award.title} side={award.person} /><div><h3>{award.title}</h3><p><T text={"For"} /> {award.person==="A" ? session.personAName : session.personBName}</p><small><T text={"A playful, unofficial award"} /></small></div></article>)}</div></section>
    <ListenTogether tracks={session.playlist || []} />
    <div className="details-grid">
      <section className="detail-card"><h2><T text={"Where your tastes meet"} /></h2><p className="field-help"><T text={"Genres inferred from your picks. Presence, not a measured audio profile."} /></p><div className="genre-table-wrap"><table className="genre-table"><caption className="sr-only"><T text={"Inferred genres for both participants"} /></caption><thead><tr><th scope="col"><T text={"Genre"} /></th><th scope="col"><span>{session.personAName}</span></th><th scope="col"><span>{session.personBName}</span></th></tr></thead><tbody>{genres.map(genre => <tr key={genre}><th scope="row">{genre}</th>{[r.personA,r.personB].map((person,index) => { const present=person.genres.some(g => g.toLowerCase()===genre); return <td key={index} className={present ? `genre-present genre-${index}` : ""}>{present ? <Check size={18} aria-label={t("Inferred")} /> : <Minus size={16} aria-label={t("Not inferred")} />}</td>; })}</tr>)}</tbody></table></div></section>
      <section className="detail-card"><h2>{r.recommendations.length}{" "}<T text={"songs for both of you"} /></h2><div className="recommendations">{r.recommendations.map((track,index) => <a key={`${index}:${track}`} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track)}`} target="_blank" rel="noopener noreferrer"><span className="track-number">{String(index+1).padStart(2,"0")}</span><span>{track}</span><ArrowUpRight size={16} aria-label={t("Opens YouTube in a new tab")} /></a>)}</div><p className="field-help"><T text={"AI suggestions to explore. Links open YouTube search."} /></p></section>
    </div>
    <p className="results-disclaimer"><T text={"Music taste is one part of a connection. This result is a playful interpretation, not a scientific compatibility test."} /></p><Link className="another-session" href="/session/new"><T text={"Compare with someone else"} /></Link>
  </main>;
}
