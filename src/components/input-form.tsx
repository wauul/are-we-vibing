"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useEffect, useState } from "react";
import ManualPicks from "./manual-picks";
import { Headphones, Music2, Play } from "lucide-react";
import { Feedback } from "./ui";
import { submission, type InputType, type SessionView } from "@/lib/schema";
import { api, rememberCreator } from "@/lib/client-api";
export { api } from "@/lib/client-api";
export function InputForm({
  id,
  onDone,
  onBusy,
  friendUsername,
}: {
  id?: string;
  onDone: (s: SessionView) => void;
  onBusy: (busy: boolean) => void;
  friendUsername?: string;
}) {
  const { t } = useLanguage();
  const [type, setType] = useState<InputType>("MANUAL");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api<{ user: { name: string } | null }>("/api/profile").then(data => { if (active && data.user) setName(current => current || data.user!.name); }).catch(() => {});
    return () => { active = false; };
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = submission.safeParse({ name, type, value });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    onBusy(true);
    try {
      const s = await api<SessionView>(
        id ? `/api/sessions/${id}/join` : "/api/sessions",
        { ...parsed.data, ...(friendUsername ? { friendUsername } : {}) },
      );
      if (!id) rememberCreator(s.id);
      onDone(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Oops. Try again.");
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="input-form">
      {friendUsername && <p className="direct-banner"><T text={"An invitation for"} /> <strong>@{friendUsername}</strong><T text={". Only they can join."} /></p>}
      <label htmlFor="name"><T text={"Your name"} /></label>
      <input
        id="name"
        autoComplete="nickname"
        maxLength={40}
        placeholder={t("Your name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={busy}
      />
      <label id="method-label"><T text={"Music source"} /></label>
      <div className="method-tabs" role="group" aria-labelledby="method-label">
        {(
          [
            { id: "MANUAL", label: "My picks", icon: Music2 },
            { id: "YOUTUBE", label: "YouTube", icon: Play },
            { id: "SPOTIFY", label: "Spotify", icon: Headphones },
          ] as const
        ).map((m) => (
          <button
            type="button"
            key={m.id}
            aria-pressed={type === m.id}
            className={type === m.id ? "active" : ""}
            onClick={() => {
              setType(m.id);
              setValue("");
              setError("");
            }}
            disabled={busy}
          >
            <m.icon size={25} aria-hidden="true" />
              <span>{t(m.label)}{m.id === "SPOTIFY" && <small className="coming-soon-badge"><T text={"Experimental"} /></small>}</span>
          </button>
        ))}
      </div>
      <label htmlFor="music">
        {type === "MANUAL"
          ? t("Your music")
          : t("Your playlist share link")}
      </label>
      {type === "MANUAL" ? (
        <ManualPicks value={value} onChange={setValue} disabled={busy} />
      ) : (
        <input
          id="music"
          type="url"
          placeholder={
            type === "SPOTIFY"
              ? "https://open.spotify.com/playlist/…"
              : "https://www.youtube.com/playlist?list=…"
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          disabled={busy}
        />
      )}
      <p className="field-help" id="picks-guidance">
        {type === "MANUAL"
          ? t("{0}/15 picks · Use commas or new lines", {0:Math.min(value.split(/[\n,]/).filter((s) => s.trim()).length, 15)})
          : type === "SPOTIFY"
            ? t("Public playlists · Up to 20 songs · No sign-in needed. If import fails, use My picks.")
            : t("Public or unlisted playlists · First 20 videos")}
      </p>
      {error && (
        <Feedback tone="error">{error}</Feedback>
      )}
      <button className="button full" disabled={busy}>
        {busy ? t("Saving your picks…") : id ? t("Compare our music") : t("Create my session")}
      </button>
      <p className="privacy">
        {friendUsername ? t("Only your invited friend can join.") : t("Anyone with your link can join and see your names and result.")}
      </p>
    </form>
  );
}

