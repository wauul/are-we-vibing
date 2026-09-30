"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useState } from "react";
import { Share2, Link2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";

export default function ShareLink({ path, text = "Let’s find out if our music tastes vibe.", compact = false }: { path: string; text?: string; compact?: boolean }) {
  const { t } = useLanguage();
  const [notice, setNotice] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(new URL(path, window.location.origin).href); setNotice("Link copied. It’s ready to send."); }
    catch { setNotice(t("Copy this link: {0}", {0:new URL(path, window.location.origin).href})); }
  }
  async function share() {
    const data = { title: "R We Vibing?", text: t(text), url: new URL(path, window.location.origin).href };
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share(data).catch(() => {}); return;
    }
    if (navigator.share) {
      try { await navigator.share(data); setNotice(""); return; }
      catch (error) { if ((error as Error).name === "AbortError") return; }
    }
    await copy();
  }
  return <div className={compact ? "share-links compact" : "share-links"}>
    <div><button type="button" className="button" onClick={share}><Share2 size={17} /><span>{t(compact ? "Share result" : "Share invite")}</span></button><button type="button" className="button outline-button" onClick={copy}><Link2 size={17} /><T text={"Copy link"} /></button></div>
    {notice && <p role="status" className="notice">{t(notice)}</p>}
  </div>;
}
