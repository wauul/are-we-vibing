"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import { beginNativeSignIn } from "@/lib/native-auth";
import { Users, UserPlus, Music2, ArrowUpRight, Sparkles } from "lucide-react";
import { api } from "@/lib/client-api";
type Profile = { id: string; name: string; username: string };
type Social = { connections: { id: string; accepted: boolean; incoming: boolean; person: Profile }[]; sessions: { id: string; personAName: string; personBName: string | null; ready: boolean; incoming: boolean; createdAt: string }[] };
export default function FriendsDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [available, setAvailable] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [social, setSocial] = useState<Social>({ connections: [], sessions: [] });
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [friendName, setFriendName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const loadSocial = useCallback(async () => setSocial(await api<Social>("/api/friends")), []);
  useEffect(() => {
    let cancelled = false;
    api<{ user: Profile | null; authAvailable: boolean }>("/api/profile").then(async result => {
      if (cancelled) return;
      setProfile(result.user); setAvailable(result.authAvailable);
      if (result.user) { setName(result.user.name); setUsername(result.user.username); await loadSocial(); }
    }).catch(error => { if (!cancelled) setMessage(error.message); }).finally(() => { if (!cancelled) setLoaded(true); });
    if (new URLSearchParams(window.location.search).has("error")) setMessage("Google sign-in did not finish. Please try again.");
    return () => { cancelled = true; };
  }, [loadSocial]);
  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => { if (!document.hidden) void loadSocial().catch(() => {}); }, 15000);
    return () => clearInterval(interval);
  }, [profile, loadSocial]);
  async function mutate(path: string, body: unknown, success: string) {
    setBusy(true); setMessage("");
    try { await api(path, body); await loadSocial(); setMessage(success); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  if (!loaded) return <main className="flow-shell"><p role="status">Opening your music circle…</p></main>;
  if (!profile) return <main className="flow-shell account-welcome"><div className="waiting-icon"><Users size={30} /></div><div className="eyebrow">YOUR PEOPLE. YOUR FREQUENCY.</div><h1>Your music circle,<br /><span className="serif orange">all in one place.</span></h1><p>Add friends, send a vibe straight to their inbox, and keep your shared results together.</p><button className="button" disabled={!available || busy} onClick={() => { setBusy(true); void (Capacitor.isNativePlatform() ? beginNativeSignIn() : signIn("google", { callbackUrl: "/friends" })).catch(() => { setBusy(false); setMessage("Could not open Google sign-in. Try again."); }); }}><span className="google-g">G</span> Continue with Google</button>{!available && <p className="field-help">Google sign-in is being connected. Guest vibe links still work.</p>}{message && <p className="error" role="alert">{message}</p>}<Link className="another-session" href="/session/new">Just here for a vibe? Continue as a guest →</Link><p className="privacy">We use Google to confirm your identity. Friends see your chosen name and username, never your email.</p></main>;
  const friends = social.connections.filter(c => c.accepted);
  const requests = social.connections.filter(c => !c.accepted);
  return <main className="friends-shell">
    <div className="friends-heading"><div><div className="eyebrow">YOUR MUSIC CIRCLE</div><h1>Hey, <span className="serif orange">{profile.name}.</span></h1><p>Good music hits different with your people.</p></div><button className="text-button" onClick={() => void signOut({ callbackUrl: "/" })}>Sign out</button></div>
    {message && <p className="notice social-notice" role="status">{message}</p>}
    <div className="friends-grid"><section className="detail-card"><div className="eyebrow">YOUR DJ CARD</div><h2>Make yourself easy to find</h2><form onSubmit={async event => { event.preventDefault(); setBusy(true); setMessage(""); try { const updated = await api<Profile>("/api/profile", { name, username }); setProfile(updated); setMessage("Profile saved. Share your username with your friends."); } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); } }}><label htmlFor="profile-name">Display name</label><input id="profile-name" value={name} maxLength={40} required onChange={e => setName(e.target.value)} /><label htmlFor="username">Username</label><input id="username" value={username} minLength={3} maxLength={24} pattern="[a-z0-9_]+" required onChange={e => setUsername(e.target.value.toLowerCase())} /><p className="field-help">Friends can find you as @{profile.username}.</p><button className="button" disabled={busy}>Save profile</button></form></section>
    <section className="detail-card"><div className="eyebrow">EXPAND THE CIRCLE</div><h2><UserPlus size={21} /> Add a friend</h2><p className="field-help">Ask for their username. They’ll accept your request before you can send direct vibes.</p><form onSubmit={async event => { event.preventDefault(); await mutate("/api/friends", { action: "add", username: friendName.replace(/^@/, "").toLowerCase().trim() }, "Friend request sent."); }}><label htmlFor="friend-username">Their username</label><input id="friend-username" placeholder="@your_favorite_dj" value={friendName} maxLength={25} required onChange={e => setFriendName(e.target.value)} /><button className="button" disabled={busy}>Send friend request</button></form></section></div>
    <section className="detail-card social-section"><div className="section-top"><div><div className="eyebrow">PASS THE AUX</div><h2>Your friends <small>({friends.length})</small></h2></div><Link className="button outline-button" href="/session/new">Create a share link</Link></div>{!friends.length && <p className="empty-state">Your circle starts with one friend. Add their username above.</p>}<div className="friend-cards">{friends.map(c => <article key={c.id}><span className="avatar">{c.person.name.slice(0, 1)}</span><div><h3>{c.person.name}</h3><small>@{c.person.username}</small></div><Link className="button" href={`/session/new?friend=${encodeURIComponent(c.person.username)}`}>Vibe <ArrowUpRight size={16} /></Link><button className="text-button" disabled={busy} onClick={() => void mutate("/api/friends", { action: "remove", id: c.id }, "Friend removed.")}>Remove</button></article>)}</div></section>
    {requests.length > 0 && <section className="detail-card social-section"><div className="eyebrow">AT THE DOOR</div><h2>Friend requests</h2>{requests.map(c => <div className="request-row" key={c.id}><div><strong>{c.person.name}</strong><small>@{c.person.username} · {c.incoming ? "Wants to be friends" : "Waiting for them"}</small></div>{c.incoming && <button className="button" disabled={busy} onClick={() => void mutate("/api/friends", { action: "accept", id: c.id }, "You’re friends! Time for a vibe check.")}>Accept</button>}<button className="text-button" disabled={busy} onClick={() => void mutate("/api/friends", { action: "remove", id: c.id }, "Request removed.")}>{c.incoming ? "Decline" : "Cancel"}</button></div>)}</section>}
    <section className="detail-card social-section"><div className="eyebrow">YOUR SHARED ROTATION</div><h2>Invitations & recent vibes</h2>{!social.sessions.length && <p className="empty-state">Your next musical discovery starts here. Send a friend a vibe!</p>}<div className="vibe-history">{social.sessions.map(s => <Link key={s.id} href={`/${s.ready ? "results" : "session"}/${s.id}`}><span className="history-icon">{s.ready ? <Sparkles size={20} /> : <Music2 size={20} />}</span><div><strong>{s.personAName} {s.personBName ? `+ ${s.personBName}` : "sent a vibe"}</strong><small>{s.ready ? "See your result" : s.incoming ? "Your turn — add your music" : "Waiting for the second side"}</small></div><ArrowUpRight size={18} /></Link>)}</div></section>
  </main>;
}
