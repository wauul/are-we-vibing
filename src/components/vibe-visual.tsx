"use client";
import { useState } from "react";
import { Heart, Pause, Play, Sparkles } from "lucide-react";

export function SoundBars({ className = "" }: { className?: string }) {
  return <div className={`sound-bars ${className}`} aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ height: `${18 + ((i * 17 + 9) % 52)}px`, animationDelay: `${i * -0.13}s` }} />)}</div>;
}

export default function VibeVisual() {
  const [playing, setPlaying] = useState(true);
  return (
    <div className={`music-scene ${playing ? "is-playing" : "is-paused"}`}>
      <div className="scene-glow" aria-hidden="true" />
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-caption"><span className="live-dot" /> CHEMISTRY, ON REPEAT <span>VOL. 01</span></div>
      <div className="sleeve sleeve-a" aria-hidden="true"><span>SIDE A</span><div className="sleeve-sun" /><strong>after<br />hours.</strong><small>YOUR WORLD · 33⅓ RPM</small></div>
      <div className="scene-record" aria-hidden="true"><div className="scene-record-label"><Heart size={30} fill="currentColor" /><small>GOOD TOGETHER</small></div></div>
      <span className="scene-star star-a" aria-hidden="true">✦</span><span className="scene-star star-b" aria-hidden="true">✧</span>
      <div className="scene-tag tag-a"><span>☾</span><div>Late-night soul<small>your kind of energy</small></div></div>
      <div className="scene-tag tag-b"><span>↗</span><div>Main-character pop<small>their kind of energy</small></div></div>
      <div className="chemistry-ticket"><Sparkles size={17} /><span>IT’S GIVING<br /><strong>92<small>%</small></strong><b>MUSICAL SOULMATES</b></span><span className="ticket-note">EXAMPLE MIX</span></div>
      <div className="scene-player"><button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause visual animation" : "Play visual animation"}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><SoundBars /><div><strong>You + them</strong><small>Two tastes. One frequency.</small></div></div>
    </div>
  );
}
