"use client";
import { useState } from "react";
import { ArrowUpRight, Headphones, Play } from "lucide-react";
import { useLanguage } from "./language-provider";
export default function SongDiscovery({ tracks }: { tracks: string[] }) {
  const { t } = useLanguage();
  const [provider, setProvider] = useState<"youtube" | "spotify">("youtube");
  return <section className="detail-card"><h2>{tracks.length} {t("songs for both of you")}</h2>
    <div className="discovery-tabs" role="group" aria-label={t("Explore songs on")}>
      <button type="button" aria-pressed={provider === "youtube"} onClick={() => setProvider("youtube")}><Play size={16} aria-hidden="true" />YouTube</button>
      <button type="button" aria-pressed={provider === "spotify"} onClick={() => setProvider("spotify")}><Headphones size={16} aria-hidden="true" />Spotify</button>
    </div>
    <div className="recommendations">{tracks.map((track, index) => <a key={`${index}:${track}`} href={provider === "spotify" ? `https://open.spotify.com/search/${encodeURIComponent(track)}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(track)}`} target="_blank" rel="noopener noreferrer">
      <span className="track-number">{String(index + 1).padStart(2, "0")}</span><span>{track}</span><ArrowUpRight size={16} aria-label={provider === "spotify" ? t("Opens Spotify in a new tab") : t("Opens YouTube in a new tab")} />
    </a>)}</div>
    <p className="field-help">{provider === "spotify" ? t("AI suggestions to explore. Links open Spotify search; choose a matching song there.") : t("AI suggestions to explore. Links open YouTube search.")}</p>
  </section>;
}
