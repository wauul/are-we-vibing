"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { SessionView } from "@/lib/schema";
import ShareableResultCard from "./ShareableResultCard";

export default function CoverPreview({ session, scoreRef }: { session: SessionView; scoreRef: RefObject<HTMLSpanElement> }) {
  const bounds = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(.7);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = bounds.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 480));
    observer.observe(element);
    const visibility = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    visibility.observe(element);
    return () => { observer.disconnect(); visibility.disconnect(); };
  }, []);
  return <div className="cover-preview" ref={bounds}>
    <div className={`cover-render ${visible ? "is-playing" : "is-paused"}`} style={{ transform: `scale(${scale})` }} aria-hidden="true"><ShareableResultCard session={session} scoreRef={scoreRef} animated /></div>
  </div>;
}
