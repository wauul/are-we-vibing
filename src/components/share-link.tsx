"use client";
import { useState } from "react";
import { Share2, Link2 } from "lucide-react";

export default function ShareLink({ path, text = "Let’s find out if our music tastes vibe.", compact = false }: { path: string; text?: string; compact?: boolean }) {
  const [notice, setNotice] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(new URL(path, window.location.origin).href); setNotice("Link copied. Pass the aux!"); }
    catch { setNotice(`Copy this link: ${new URL(path, window.location.origin).href}`); }
  }
  async function share() {
    const data = { title: "R We Vibing?", text, url: new URL(path, window.location.origin).href };
    if (navigator.share) {
      try { await navigator.share(data); setNotice(""); return; }
      catch (error) { if ((error as Error).name === "AbortError") return; }
    }
    await copy();
  }
  return <div className={compact ? "share-links compact" : "share-links"}>
    <div><button type="button" className="button" onClick={share}><Share2 size={17} /> Share {compact ? "result" : "invite"}</button><button type="button" className="button outline-button" onClick={copy}><Link2 size={17} /> Copy link</button></div>
    {notice && <p role="status" className="notice">{notice}</p>}
  </div>;
}
