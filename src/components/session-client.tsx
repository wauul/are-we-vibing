"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionView } from "@/lib/schema";
import { InputForm, api } from "./input-form";
import { isCreator } from "@/lib/client-api";
import { ArtworkStage, MusicScene, RecoveryArt } from "./music-art";
import { Feedback, LoadingState, Side } from "./ui";
import ShareLink from "./share-link";
import NativePush from "./native-push";
export function Matching() {
  return <div className="matching" role="status"><MusicScene mode="matching" /><h2><T text={"Finding your common ground"} /></h2><p><T text={"Comparing your music and choosing songs for both of you."} /></p></div>;
}
export default function SessionClient({ id }: { id: string }) {
  const { t } = useLanguage();
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
    setFriendUsername(isNew && friend && /^[a-z0-9_]{3,24}$/.test(friend) ? friend : undefined);
  }, [isNew]);
  const refresh = useCallback(async () => {
    if (isNew) return;
    try { const s = await api<SessionView>(`/api/sessions/${id}`); setSession(s); setError(""); if (s.status === "ready") router.replace(`/results/${id}`); }
    catch (e) { setError((e as Error).message); }
  }, [id, isNew, router]);
  useEffect(() => {
    if (busy) return;
    setOwner(isCreator(id)); void refresh();
    if (isNew) return;
    const timer = setInterval(() => void refresh(), 3000);
    return () => clearInterval(timer);
  }, [id, isNew, busy, refresh]);
  async function retry() {
    setBusy(true); setError("");
    try { await api(`/api/sessions/${id}/regenerate`, {}); await refresh(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  if (!isNew && !session) return <main id="content" className="flow-shell">{error ? <div className="recovery-panel"><RecoveryArt kind={error.toLowerCase().includes("direct invite") ? "invite" : "retry"} /><h1>{error.toLowerCase().includes("direct invite") ? t("This mix is invitation only") : t("We couldn’t open this session")}</h1><Feedback tone="error">{error}</Feedback><div className="action-row"><button className="button" onClick={() => void refresh()}><T text={"Try again"} /></button><Link className="button outline-button" href="/friends"><T text={"Sign in"} /></Link></div></div> : <LoadingState />}</main>;
  const waiting = (owner || session?.isOwner) && !joinHere && session?.status === "waiting";
  const matching = busy || session?.status === "matching";
  const entry = !waiting && !matching && session?.status !== "retry";
  const step = isNew ? 0 : session?.status === "waiting" ? 1 : 2;
  const capped = session?.status === "retry" && session.generationAttempts >= 5;
  return <main id="content" className="session-shell">
    <ol className="flow-progress" aria-label={t("Session progress")}>{["Your taste", "Their taste", "Your mix"].map((label, index) => <li key={label} className={index <= step ? "done" : ""} aria-current={index === step ? "step" : undefined}><span>{index + 1}</span>{t(label)}</li>)}</ol>
    <div className="session-layout">
      <aside className={`session-context ${entry ? "session-entry" : ""}`}>
        {entry ? <div className="picks-art"><ArtworkStage kind="picks" /><Side side={isNew ? "A" : "B"} /></div> : <Side side={waiting ? "A" : "B"} />}
        <h1>{isNew ? <><T text={"Your side"} /><br />{" "}<T text={"of the mix"} /></> : waiting ? <><T text={"Your side"} /><br />{" "}<T text={"is ready"} /></> : matching ? <><T text={"Two tastes,"} /><br />{" "}<T text={"one new mix"} /></> : session?.status === "retry" ? capped ? t("Time for a fresh mix") : t("Your mix is on hold") : <><T text={"Add your side"} /></>}</h1>
        {!isNew && <p>{waiting ? t("Invite someone to compare music with you, {0}.", {0:session?.personAName}) : matching ? t("Your music is coming together.") : t("A mix with {0}.", {0:session?.personAName})}</p>}
      </aside>
      <section className="flow-card" aria-label={t("Music session")}>
        {matching && <Matching />}
        <div hidden={matching}>
          {waiting ? <div className="waiting"><MusicScene mode="waiting" /><h2><T text={"Pass the mix"} /></h2><p><T text={"Share this link with your person. This page updates when your result is ready."} /></p><label htmlFor="invite-link"><T text={"Your session link"} /></label><input id="invite-link" readOnly value={typeof window !== "undefined" ? `${window.location.origin}/session/${id}` : ""} onFocus={e => e.target.select()} /><ShareLink path={`/session/${id}`} /><NativePush sessionId={id} />{session?.isDirect ? <Feedback><T text={"Only your invited friend can join. The invitation is also in their music circle."} /></Feedback> : <><p className="privacy"><T text={"Anyone with this link can join the open seat and view your result."} /></p><div className="same-device-block"><h3><T text={"In the same room?"} /></h3><p><T text={"They can add their music on this device."} /></p><button className="button outline-button" onClick={() => setJoinHere(true)}><T text={"Add their taste here"} /></button></div></>}</div>
          : session?.status === "retry" ? <div className="waiting recovery-panel"><RecoveryArt kind={capped ? "capped" : "retry"} /><h2><T text={"Your lists are saved"} /></h2><p>{capped ? t("No attempts remain for this mix. Your lists are still saved.") : t("The mix couldn’t finish. Try again with your saved music.")}</p><div className="action-row"><button className="button" onClick={retry} disabled={capped}>{capped ? t("No retries left") : t("Try the mix again")}</button>{capped && <Link className="button" href="/session/new"><T text={"Start a new session"} /></Link>}</div></div>
          : <InputForm id={isNew ? undefined : id} friendUsername={isNew ? friendUsername : undefined} onBusy={setBusy} onDone={s => router.push(`/${isNew ? "session" : "results"}/${s.id}`)} />}
        </div>
        {error && <Feedback tone="error">{error}</Feedback>}
      </section>
    </div>
  </main>;
}
