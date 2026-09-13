"use client";
import { useState } from "react";
import ManualPicks from "./manual-picks";
import { ArrowRight, Headphones, Music2, Play } from "lucide-react";
import { submission, type InputType, type SessionView } from "@/lib/schema";
import { api, rememberCreator } from "@/lib/client-api";
export { api } from "@/lib/client-api";
export function InputForm({
  id,
  onDone,
  onBusy,
}: {
  id?: string;
  onDone: (s: SessionView) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [type, setType] = useState<InputType>("MANUAL");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
    const start = Date.now();
    try {
      const s = await api<SessionView>(
        id ? `/api/sessions/${id}/join` : "/api/sessions",
        parsed.data,
      );
      await new Promise((r) =>
        setTimeout(r, Math.max(0, 1800 - (Date.now() - start))),
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
      <label htmlFor="name">What should we call you?</label>
      <input
        id="name"
        autoComplete="nickname"
        maxLength={40}
        placeholder="Your name or DJ alter ego"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={busy}
      />
      <label id="method-label">Choose your music source</label>
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
            disabled={busy || m.id === "SPOTIFY"}
          >
            <m.icon size={17} />
            <span>{m.label}{m.id === "SPOTIFY" && <small className="coming-soon-badge">Coming soon</small>}</span>
          </button>
        ))}
      </div>
      <p className="source-note"><Headphones size={13} /> Spotify playlist import is coming soon. For now, add favorites from any music app with My picks.</p>
      <label htmlFor="music">
        {type === "MANUAL"
          ? "Your on-repeat artists & songs"
          : "Your playlist share link"}
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
      <p className="field-help">
        {type === "MANUAL"
          ? `${Math.min(value.split(/[\n,]/).filter((s) => s.trim()).length, 15)}/15 picks · Separate with commas or new lines. First 15 used.`
          : type === "SPOTIFY"
            ? "Spotify’s developer terms do not allow its playlist data in AI vibe checks. Choose YouTube or add your own picks."
            : "Public or unlisted playlists · First 20 videos."}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="button full" disabled={busy || type === "SPOTIFY"}>
        {busy ? "Spinning up…" : id ? "Check our vibe" : "Make my session"}
        <ArrowRight size={18} />
      </button>
      <p className="privacy">
        Anyone with your link can join and view your names and result. Share it
        with your person.
      </p>
    </form>
  );
}

