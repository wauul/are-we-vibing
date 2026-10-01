"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import Image from "next/image";
import { Check, ChevronRight, Clock3, UserPlus, X } from "lucide-react";
import { nativeGoogleSignIn } from "@/lib/native-google";
import { api } from "@/lib/client-api";
import { useLanguage } from "./language-provider";
import { type Profile } from "./account-profile";
import RecordAvatar from "./record-avatar";
import UsernameCard from "./username-card";
import { ArtworkStage } from "./music-art";
import { Feedback, LoadingState } from "./ui";

type Connection = { id: string; accepted: boolean; incoming: boolean; person: Profile };
type Social = { connections: Connection[]; sessions: { id: string; personAName: string; personBName: string | null; ready: boolean; incoming: boolean; createdAt: string }[] };

export default function FriendsDashboard() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [available, setAvailable] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [social, setSocial] = useState<Social>({ connections: [], sessions: [] });
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [removing, setRemoving] = useState<Connection | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const loadSocial = useCallback(async () => setSocial(await api<Social>("/api/friends")), []);
  const load = useCallback(async () => {
    setLoaded(false); setLoadFailed(false); setMessage("");
    try {
      const result = await api<{ user: Profile | null; authAvailable: boolean }>("/api/profile");
      setProfile(result.user); setAvailable(result.authAvailable);
      if (result.user) await loadSocial();
    } catch (error) { setLoadFailed(true); setFailed(true); setMessage((error as Error).message); }
    finally {
      if (new URLSearchParams(window.location.search).has("error")) { setFailed(true); setMessage(t("Google sign-in didn’t finish. Try again.")); }
      setLoaded(true);
    }
  }, [loadSocial, t]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => { if (!document.hidden) void loadSocial().catch(() => {}); }, 15000);
    return () => clearInterval(interval);
  }, [profile, loadSocial]);
  useEffect(() => { if (removing) dialog.current?.showModal(); }, [removing]);

  async function mutate(body: { action: string; id: string }, success: string) {
    if (busy) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      await api("/api/friends", body);
      setSocial(current => ({ ...current, connections: body.action === "remove" ? current.connections.filter(connection => connection.id !== body.id) : current.connections.map(connection => connection.id === body.id ? { ...connection, accepted: true } : connection) }));
      setMessage(success);
      void loadSocial().catch(() => {});
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  if (!loaded) return <main id="content" className="account-shell"><LoadingState label={t("Loading your music circle")} /></main>;
  if (loadFailed) return <main id="content" className="account-shell"><h1>{t("Your music circle")}</h1><Feedback tone="error">{message}</Feedback><button className="button" onClick={() => void load()}>{t("Try again")}</button></main>;
  if (!profile) return <main id="content" className="flow-shell account-welcome">
    <h1>{t("Your music circle")}</h1>
    <div className="welcome-visual"><ArtworkStage kind="friends" /></div>
    <div className="welcome-actions">
      <p>{t("Keep your people and shared mixes together.")}</p>
      <button className="button" disabled={!available || busy} onClick={() => {
        setBusy(true);
        void (Capacitor.isNativePlatform() ? nativeGoogleSignIn() : signIn("google", { callbackUrl: "/friends" })).catch(() => { setBusy(false); setFailed(true); setMessage(t("Google sign-in couldn’t open. Please try again.")); });
      }}><span className="google-g" aria-hidden="true">G</span>{busy ? t("Opening Google…") : t("Continue with Google")}</button>
      {!available && <Feedback>{t("Google sign-in is unavailable here. You can still start a guest session.")}</Feedback>}
      {message && <Feedback tone={failed ? "error" : "success"}>{message}</Feedback>}
      <Link className="text-button" href="/session/new">{t("Create a guest session")}</Link>
      <p className="privacy">{t("Friends see your name and username, never your email.")}</p>
      <p className="signin-legal"><Link href="/privacy">{t("Privacy")}</Link> · <Link href="/terms">{t("Terms")}</Link></p>
      <Link className="privacy" href="/review-login">Review access</Link>
    </div>
  </main>;
  const friends = social.connections.filter(connection => connection.accepted);
  const incoming = social.connections.filter(connection => !connection.accepted && connection.incoming);
  const outgoing = social.connections.filter(connection => !connection.accepted && !connection.incoming);
  return <main id="content" className="friends-shell circle-dashboard">
    <div className="circle-heading"><div><h1>{t("Your music circle")}</h1><p>{t("Your people. Your shared sound.")}</p></div><Link className="button" href="/friends/add"><UserPlus size={18} aria-hidden="true" />{t("Add a friend")}</Link></div>
    <UsernameCard username={profile.username} />
    {message && <Feedback tone={failed ? "error" : "success"}>{message}</Feedback>}
    {incoming.length > 0 && <section className="social-section" aria-labelledby="requests-heading"><h2 id="requests-heading">{t("Friend requests")} <small>({incoming.length})</small></h2><div className="people-list">{incoming.map(connection => <article className="people-row request-person" key={connection.id}>
      <RecordAvatar name={connection.person.name} seed={connection.person.username} small /><div className="person-label"><strong>{connection.person.name}</strong><small>@{connection.person.username}</small></div>
      <div className="request-buttons"><button className="button outline-button" disabled={busy} aria-label={t("Accept friend request from {0}", { 0: connection.person.name })} onClick={() => void mutate({ action: "accept", id: connection.id }, t("Request accepted. You can now send direct invitations."))}><Check size={16} aria-hidden="true" />{t("Accept")}</button><button className="text-button" disabled={busy} aria-label={t("Decline friend request from {0}", { 0: connection.person.name })} onClick={() => void mutate({ action: "remove", id: connection.id }, t("Request removed."))}>{t("Decline")}</button></div>
    </article>)}</div></section>}
    <section className="social-section" aria-labelledby="friends-heading"><h2 id="friends-heading">{t("Friends")} <small>({friends.length})</small></h2>
      {!friends.length ? <div className="friends-empty"><ArtworkStage kind="friends" /><h3>{t("Your circle starts with one friend")}</h3><p>{t("Add a friend above or share your username.")}</p></div> : <div className="people-list">{friends.map(connection => <article className="people-row friend-person" key={connection.id}>
        <RecordAvatar name={connection.person.name} seed={connection.person.username} small /><div className="person-label"><strong>{connection.person.name}</strong><small>@{connection.person.username}</small></div>
        <div className="person-actions"><Link className="button outline-button" href={`/session/new?friend=${encodeURIComponent(connection.person.username)}`}>{t("Start a mix")}</Link><button className="text-button remove-friend-action" disabled={busy} aria-label={t("Remove {0} from friends", { 0: connection.person.name })} onClick={() => setRemoving(connection)}>{t("Remove")}</button></div>
      </article>)}</div>}
    </section>
    {outgoing.length > 0 && <section className="social-section" aria-labelledby="sent-heading"><h2 id="sent-heading">{t("Sent requests")} <small>({outgoing.length})</small></h2><div className="people-list">{outgoing.map(connection => <article className="people-row" key={connection.id}>
      <RecordAvatar name={connection.person.name} seed={connection.person.username} small /><div className="person-label"><strong>{connection.person.name}</strong><small>@{connection.person.username} · <Clock3 size={12} aria-hidden="true" />{t("Pending")}</small></div>
      <button className="text-button" disabled={busy} aria-label={t("Cancel request to {0}", { 0: connection.person.name })} onClick={() => void mutate({ action: "remove", id: connection.id }, t("Request removed."))}>{t("Cancel")}</button>
    </article>)}</div></section>}
    <section className="social-section" aria-labelledby="mixes-heading"><div className="section-top"><h2 id="mixes-heading">{t("Your mixes")}</h2><Link className="text-button" href="/session/new">{t("New guest session")}<ChevronRight size={16} aria-hidden="true" /></Link></div>
      {!social.sessions.length ? <div className="mixes-empty"><Image src="/art/record-player.webp" width={64} height={64} alt="" /><div><h3>{t("No mixes yet")}</h3><p>{t("Start a mix with a friend or create a guest session.")}</p></div></div> : <div className="vibe-history">{social.sessions.map(session => <Link key={session.id} href={`/${session.ready ? "results" : "session"}/${session.id}`}>
        <span className={`history-art ${session.ready ? "history-ready" : ""}`}><Image src={session.ready ? "/art/music-universe.webp" : "/art/record-player.webp"} width={64} height={64} sizes="64px" alt="" /></span><div><strong>{session.personAName} + {session.personBName || (session.incoming ? profile.name : t("a friend"))}</strong><small><span className={`mix-status ${session.ready ? "mix-ready" : ""}`} aria-hidden="true" />{session.ready ? t("Result ready") : session.incoming ? t("Your turn") : t("Waiting")}</small></div><ChevronRight size={18} aria-hidden="true" />
      </Link>)}</div>}
    </section>
    <dialog ref={dialog} className="account-dialog" aria-labelledby="remove-title" aria-describedby="remove-description" onClose={() => setRemoving(null)}>
      <button className="icon-button dialog-close" aria-label={t("Close")} onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button>
      <h2 id="remove-title">{t("Remove {0}?", { 0: removing?.person.name || "" })}</h2><p id="remove-description">{t("You’ll need a new friend request to reconnect. Existing mixes stay available.")}</p>
      <button className="button destructive-button" onClick={() => { if (removing) void mutate({ action: "remove", id: removing.id }, t("Friend removed. Existing sessions are still available.")); dialog.current?.close(); }}>{t("Remove friend")}</button><button className="text-button" onClick={() => dialog.current?.close()}>{t("Cancel")}</button>
    </dialog>
  </main>;
}
