"use client";
import { MusicScene } from "./music-art";
export function SoundBars({ className = "" }: { className?: string }) {
  return <div className={`sound-bars ${className}`} aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ height: `${12 + ((i * 17 + 9) % 38)}px`, animationDelay: `${i * -0.13}s` }} />)}</div>;
}
export default function VibeVisual() { return <MusicScene />; }
