"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones, Link2, Music2 } from "lucide-react";
import type { SessionView } from "@/lib/schema";
import { InputForm, api } from "./input-form";
import { isCreator } from "@/lib/client-api";
import { SoundBars } from "./vibe-visual";
import ShareLink from "./share-link";
import Link from "next/link";
export function Matching() {
  return (
    <div className="matching" role="status">
      <div className="matching-icons">
        <Headphones />
        <span>✦</span>
        <Music2 />
      </div>
      <h2>Finding your frequency…</h2>
      <p>Comparing guilty pleasures. Negotiating the aux cord.</p>
      <SoundBars />
    </div>
  );
}
export default function SessionClient({ id }: { id: string }) {
  const router = useRouter();
  const isNew = id === "new";
  const [session, setSession] = useState<SessionView | null>(null);
  const [owner, setOwner] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [joinHere, setJoinHere] = useState(false);
  const [friendUsername, setFriendUsername] = useState<string>();
  useEffect(() => {
    const friend = new URLSearchParams(window.location.search).get("friend");
    if (isNew && friend && /^[a-z0-9_]{3,24}$/.test(friend)) setFriendUsername(friend);
    else setFriendUsername(undefined);
  }, [isNew]);
  const refresh = useCallback(async () => {
    if (isNew) return;
    try {
      const s = await api<SessionView>(`/api/sessions/${id}`);
      setSession(s);
      setError("");
      if (s.status === "ready") router.replace(`/results/${id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id, isNew, router]);
  useEffect(() => {
    if (busy) return;
    setOwner(isCreator(id));
    void refresh();
    if (isNew || busy) return;
    const timer = setInterval(() => void refresh(), 3000);
    return () => clearInterval(timer);
  }, [id, isNew, busy, refresh]);
  async function retry() {
    setBusy(true);
    setError("");
    const start = Date.now();
    try {
      await api(`/api/sessions/${id}/regenerate`, {});
      await new Promise((r) =>
        setTimeout(r, Math.max(0, 1800 - (Date.now() - start))),
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!isNew && !session)
    return (
      <main className="flow-shell">
        <p role="status">{error || "Loading your mixtape…"}</p>{error && <Link className="button" href="/friends">Sign in / open your music circle</Link>}
      </main>
    );
  const waiting = (owner || session?.isOwner) && !joinHere && session?.status === "waiting";
  const matching = busy || session?.status === "matching";
  return (
    <main className="flow-shell">
      <div className="flow-progress" aria-label="Session progress"><span className="done">01 <b>Your taste</b></span><i /><span className={!isNew ? "done" : ""}>02 <b>Their taste</b></span><i /><span>03 <b>The reveal</b></span></div>
      <div className="eyebrow">
        {isNew
          ? "SIDE A · YOUR TURN"
          : waiting
            ? "THE AUX HAS BEEN PASSED"
            : "SIDE B · JOIN THE SESSION"}
      </div>
      <h1 className="flow-title">
        {isNew
          ? "Every connection starts"
          : waiting
            ? "One link. Two music worlds."
            : `You + ${session?.personAName}`}
        <br />
        <span className="serif orange">
          {isNew
            ? "with a good song."
            : waiting
              ? "Send yours."
              : "Let’s hear your side."}
        </span>
      </h1>
      <div className="flow-card">
        {matching && <Matching />}
        <div hidden={matching}>
          {waiting ? (
            <div className="waiting">
              <div className="waiting-icon">
                <Link2 size={30} />
              </div>
              <h2>Waiting for your person</h2>
              <p>
                Your taste is locked in, {session?.personAName}. Send this link
                and let the musical judgment begin.
              </p>
              <input
                aria-label="Shareable session link"
                readOnly
                value={
                  typeof window !== "undefined" ? `${window.location.origin}/session/${id}` : ""
                }
              />
              <ShareLink path={`/session/${id}`} />
              {session?.isDirect && <p className="direct-banner">Your friend’s invitation is in their music circle. Only they can join this session.</p>}
              <p className="micro">
                This page updates automatically when they join.
              </p>
              {!session?.isDirect && <button className="same-device" onClick={() => setJoinHere(true)}>Together in person? Add their taste on this device →</button>}
            </div>
          ) : session?.status === "retry" ? (
            <div className="waiting">
              <h2>The DJ needs another take.</h2>
              <p>Both your music lists are saved. Let’s try that mix again.</p>
              <button
                className="button"
                onClick={retry}
                disabled={session.generationAttempts >= 5}
              >
                {session.generationAttempts >= 5
                  ? "Retry limit reached — start a new session"
                  : "Regenerate our vibe"}
              </button>
            </div>
          ) : (
            <InputForm
              id={isNew ? undefined : id}
              friendUsername={isNew ? friendUsername : undefined}
              onBusy={setBusy}
              onDone={(s) => {
                if (isNew) router.push(`/session/${s.id}`);
                else router.push(`/results/${s.id}`);
              }}
            />
          )}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      <p className="flow-foot">
        A little taste. A little chemistry. A lot to talk about.
      </p>
    </main>
  );
}
