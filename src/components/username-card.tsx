"use client";
import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { useLanguage } from "./language-provider";
import { Feedback } from "./ui";

export default function UsernameCard({ username }: { username: string }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  async function share(copy: boolean) {
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const url = `${window.location.origin}/friends/add?username=${encodeURIComponent(username)}`;
      const text = t("Add me on R We Vibing: @{0}", { 0: username });
      if (copy) {
        await navigator.clipboard.writeText(`@${username}`);
        setMessage(t("Username copied."));
      } else if (Capacitor.isNativePlatform()) {
        await Share.share({ title: "R We Vibing?", text, url, dialogTitle: t("Share username") });
      } else if (navigator.share) {
        await navigator.share({ title: "R We Vibing?", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setMessage(t("Friend link copied."));
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setFailed(true); setMessage(t("Couldn’t share. You can send your username directly."));
      }
    } finally { setBusy(false); }
  }
  return <section className="username-card" aria-label={t("Your username")}>
    <div><span>{t("Your username")}</span><strong>@{username}</strong></div>
    <div className="username-actions">
      <button className="text-button" disabled={busy} onClick={() => void share(true)}><Copy size={17} aria-hidden="true" />{t("Copy")}</button>
      <button className="text-button" disabled={busy} onClick={() => void share(false)}><Share2 size={17} aria-hidden="true" />{t("Share")}</button>
    </div>
    {message && <Feedback tone={failed ? "error" : "success"}>{message}</Feedback>}
  </section>;
}
