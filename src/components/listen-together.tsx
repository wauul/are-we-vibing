"use client";
import { useEffect, useRef, useState } from "react";
import type { PlaylistTrack } from "@/lib/schema";
import { loadYouTubePlayer, nextPlayableIndex, type YouTubePlayer } from "@/lib/youtube-player";

export default function ListenTogether({ tracks }: { tracks: PlaylistTrack[] }) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer>();
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [started, setStarted] = useState(false);
  const selected = useRef(0);
  const playTrack = (index: number) => {
    selected.current = index; setCurrent(index); setUnavailable(false);
    // Queue from the chosen song. YouTube can silently remove unavailable IDs.
    player.current?.loadPlaylist({ playlist: tracks.slice(index).map(t => t.videoId), index: 0 });
  };
  useEffect(() => {
    if (!tracks.length || !host.current) return;
    let cancelled = false;
    const failed = new Set<number>();
    setReady(false); setUnavailable(false); setCurrent(0); setStarted(false);
    selected.current = 0;
    const originalIndex = (target: YouTubePlayer) => {
      const videoId = target.getPlaylist()?.[target.getPlaylistIndex()];
      const index = tracks.findIndex(track => track.videoId === videoId);
      return index >= 0 ? index : selected.current;
    };
    const target = document.createElement("div"); host.current.appendChild(target);
    void loadYouTubePlayer().then(YT => {
      if (cancelled) return;
      player.current = new YT.Player(target, {
        width: "100%", height: "100%", playerVars: { playsinline: 1, controls: 1, autoplay: 0, origin: window.location.origin, rel: 0 },
        events: {
          onReady: event => { if (!cancelled) { event.target.cuePlaylist({ playlist: tracks.map(t => t.videoId), index: 0 }); setReady(true); } },
          onStateChange: event => { if (!cancelled) { const index = originalIndex(event.target); selected.current = index; setCurrent(index); if (event.data === 1) setStarted(true); } },
          onError: event => {
            if (cancelled) return;
            const index = originalIndex(event.target); failed.add(index);
            console.warn("Skipping unavailable YouTube track", tracks[index]?.videoId, event.data);
            const next = nextPlayableIndex(index, tracks.length, failed);
            if (next !== null) { selected.current = next; setCurrent(next); event.target.loadPlaylist({ playlist: tracks.slice(next).map(t => t.videoId), index: 0 }); }
            else { event.target.pauseVideo(); setUnavailable(true); }
          },
        },
      });
    }).catch(() => { if (!cancelled) setUnavailable(true); });
    const pause = () => player.current?.pauseVideo();
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", visibility); window.addEventListener("vibe:pause-player", pause);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", visibility); window.removeEventListener("vibe:pause-player", pause); player.current?.destroy(); player.current = undefined; target.remove(); };
  }, [tracks]);
  if (!tracks.length) return null;
  return <section className="listen-section detail-card"><div className="eyebrow">YOUR SHARED ROTATION · YOUTUBE</div><h2>Press play on your chemistry.</h2>
    <p className="field-help">{tracks.length} shared picks. The same track list for both of you; playback is controlled separately.</p>
    <div className="listen-grid"><div><div ref={host} className="youtube-player" aria-label="Shared YouTube playlist player" />
      <button className="button" disabled={!ready} onClick={() => { playTrack(current); setStarted(true); }}>{started ? "Play selected track" : "Listen together"} ▶</button>
      <p className="field-help">Tap to start sound. Playback pauses when you leave the app.</p>
      {unavailable && <p role="status" className="notice">Some tracks can’t play here right now. Try a track below or open it on YouTube.</p>}
    </div><ol className="playlist-tracks">{tracks.map((track, index) => <li key={track.videoId} className={current === index ? "playing" : ""}>
      <button type="button" disabled={!ready} aria-current={current === index ? "true" : undefined} onClick={() => playTrack(index)}>
        {/* YouTube-provided thumbnails accompany their videos, not audio extraction. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.thumbnailUrl} alt="" width={88} height={66} loading="lazy" /><span><small>{String(index + 1).padStart(2, "0")}{current === index ? " · SELECTED" : ""}</small>{track.title}</span>
      </button><a href={`https://www.youtube.com/watch?v=${track.videoId}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${track.title} on YouTube`}>↗</a>
    </li>)}</ol></div></section>;
}
