"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import { nativeGoogleSignIn } from "@/lib/native-google";
import Image from "next/image";
import { Check, Clock3, LogOut, Pencil, UserMinus, UserPlus, X } from "lucide-react";
import RecordAvatar from "./record-avatar";
import { ArtworkStage } from "./music-art";
import { api } from "@/lib/client-api";
import { Feedback, LoadingState } from "./ui";
type Profile={ id:string; name:string; username:string };
type Social={ connections:{ id:string; accepted:boolean; incoming:boolean; person:Profile }[]; sessions:{ id:string; personAName:string; personBName:string|null; ready:boolean; incoming:boolean; createdAt:string }[] };
export default function FriendsDashboard() {
  const { t } = useLanguage();
  const [profile,setProfile]=useState<Profile|null>(null);
  const [available,setAvailable]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [social,setSocial]=useState<Social>({ connections:[],sessions:[] });
  const [name,setName]=useState(""); const [username,setUsername]=useState(""); const [friendName,setFriendName]=useState("");
  const [message,setMessage]=useState(""); const [failed,setFailed]=useState(false); const [busy,setBusy]=useState(false);
  const loadSocial=useCallback(async()=>setSocial(await api<Social>("/api/friends")),[]);
  useEffect(()=>{
    let cancelled=false;
    api<{ user:Profile|null; authAvailable:boolean }>("/api/profile").then(async result=>{
      if(cancelled)return;
      setProfile(result.user);setAvailable(result.authAvailable);
      if(result.user){setName(result.user.name);setUsername(result.user.username);await loadSocial();}
    }).catch(error=>{if(!cancelled){setFailed(true);setMessage(error.message);}}).finally(()=>{if(!cancelled)setLoaded(true);});
    if(new URLSearchParams(window.location.search).has("error")){setFailed(true);setMessage("Google sign-in didn’t finish. Try again.");}
    return()=>{cancelled=true;};
  },[loadSocial]);
  useEffect(()=>{if(!profile)return;const interval=setInterval(()=>{if(!document.hidden)void loadSocial().catch(()=>{});},15000);return()=>clearInterval(interval);},[profile,loadSocial]);
  async function mutate(path:string,body:unknown,success:string){
    setBusy(true);setMessage("");setFailed(false);
    try{await api(path,body);await loadSocial();setMessage(success);if(path==="/api/friends"&&(body as {action:string}).action==="add")setFriendName("");}
    catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}
  }
  if(!loaded)return <main id="content" className="flow-shell"><LoadingState label={t("Loading your music circle")} /></main>;
  if(!profile)return <main id="content" className="flow-shell account-welcome">
    <h1><T text={"Your music circle"} /></h1>
    <div className="welcome-visual"><ArtworkStage kind="friends" /></div>
    <div className="welcome-actions">
      <p><T text={"Keep your people and shared mixes together."} /></p>
      <button className="button" disabled={!available||busy} onClick={()=>{setBusy(true);void(Capacitor.isNativePlatform()?nativeGoogleSignIn():signIn("google",{callbackUrl:"/friends"})).catch(()=>{setBusy(false);setFailed(true);setMessage("Google sign-in couldn’t open. Please try again.");});}}><span className="google-g" aria-hidden="true">G</span>{busy?t("Opening Google…"):t("Continue with Google")}</button>
      {!available&&<Feedback><T text={"Google sign-in is unavailable here. You can still start a guest session."} /></Feedback>}
      {message&&<Feedback tone={failed?"error":"success"}>{message}</Feedback>}
      <Link className="button outline-button" href="/session/new"><T text={"Create a guest session"} /></Link>
      <p className="privacy"><T text={"Friends see your name and username, never your email."} /></p>
    </div>
  </main>;
  const friends=social.connections.filter(c=>c.accepted);const requests=social.connections.filter(c=>!c.accepted);
  return <main id="content" className="friends-shell">
    <div className="circle-banner">
      <div className="circle-banner-copy"><h1><T text={"Your music circle"} /></h1><span className="circle-username">@{profile.username}</span><Link className="button" href="/session/new"><T text={"New guest session"} /></Link></div>
      <ArtworkStage kind="friends" />
      <button className="icon-button circle-signout" aria-label={t("Sign out")} title={t("Sign out")} onClick={()=>void signOut({callbackUrl:"/"})}><LogOut size={19} aria-hidden="true" /></button>
    </div>
    {message&&<Feedback tone={failed?"error":"success"}>{message}</Feedback>}
    <section className="social-section"><div className="section-top"><h2><T text={"Friends"} /> <small>({friends.length})</small></h2><a className="icon-button" href="#add-friend" aria-label={t("Add a friend")} title={t("Add a friend")}><UserPlus size={21} aria-hidden="true" /></a></div>
      {!friends.length?<div className="circle-empty"><RecordAvatar name={profile.name} seed={profile.username} /><div><h3><T text={"Add your first friend"} /></h3><p><T text={"Send a request with their username."} /></p><a className="button outline-button" href="#add-friend"><T text={"Add a friend"} /></a></div></div>:<div className="friend-cards">{friends.map(c=><article key={c.id}>
        <RecordAvatar name={c.person.name} seed={c.person.username} /><div><h3>{c.person.name}</h3><small>@{c.person.username}</small></div>
        <Link className="button outline-button" href={`/session/new?friend=${encodeURIComponent(c.person.username)}`}><T text={"Invite"} /></Link>
        <button className="icon-button friend-remove" disabled={busy} aria-label={t("Remove {0} from friends", {0:c.person.name})} title={t("Remove friend")} onClick={()=>void mutate("/api/friends",{action:"remove",id:c.id},"Friend removed. Existing sessions are still available.")}><UserMinus size={17} aria-hidden="true" /></button>
      </article>)}</div>}
    </section>
    {requests.length>0&&<section className="social-section"><h2><T text={"Friend requests"} /></h2>{requests.map(c=><div className="request-row" key={c.id}>
      <RecordAvatar name={c.person.name} seed={c.person.username} small /><div><strong>{c.person.name}</strong><small>@{c.person.username}{!c.incoming&&<> · <Clock3 size={12} aria-hidden="true" /><T text={"Pending"} /></>}</small></div>
      {c.incoming&&<button className="button request-action" disabled={busy} aria-label={t("Accept friend request from {0}", {0:c.person.name})} title={t("Accept request")} onClick={()=>void mutate("/api/friends",{action:"accept",id:c.id},"Request accepted. You can now send direct invitations.")}><Check size={21} aria-hidden="true" /></button>}
      <button className="icon-button" disabled={busy} aria-label={t("{0} friend request {1} {2}", {0:t(c.incoming?"Decline":"Cancel"),1:t(c.incoming?"from":"to"),2:c.person.name})} title={c.incoming?t("Decline request"):t("Cancel request")} onClick={()=>void mutate("/api/friends",{action:"remove",id:c.id},"Request removed.")}><X size={21} aria-hidden="true" /></button>
    </div>)}</section>}
    <section className="social-section"><h2><T text={"Your mixes"} /></h2>
      {!social.sessions.length?<div className="circle-empty"><Image src="/art/record-player.webp" width={112} height={112} alt="" /><div><h3><T text={"No mixes yet"} /></h3><Link className="button outline-button" href="/session/new"><T text={"Start a mix"} /></Link></div></div>:<div className="vibe-history">{social.sessions.map(s=><Link key={s.id} href={`/${s.ready?"results":"session"}/${s.id}`}>
        <span className={`history-art ${s.ready?"history-ready":""}`}><Image src={s.ready?"/art/music-universe.webp":"/art/record-player.webp"} width={96} height={96} sizes="96px" alt="" /></span>
        <div><strong>{s.personAName} + {s.personBName||(s.incoming?profile.name:t("a friend"))}</strong><small><span className={`mix-status ${s.ready?"mix-ready":""}`} aria-hidden="true" />{s.ready?t("Result ready"):s.incoming?t("Your turn"):t("Waiting")}</small></div>
      </Link>)}</div>}
    </section>
    <div className="friends-grid"><section className="detail-card" id="add-friend"><h2><T text={"Add a friend"} /></h2>
      <form onSubmit={async event=>{event.preventDefault();await mutate("/api/friends",{action:"add",username:friendName.replace(/^@/,"").toLowerCase().trim()},"Friend request sent.");}}><label htmlFor="friend-username"><T text={"Their username"} /></label><input id="friend-username" placeholder="@username" value={friendName} maxLength={25} required onChange={e=>setFriendName(e.target.value)} disabled={busy}/><p className="field-help"><T text={"They’ll need to accept your request."} /></p><button className="button" disabled={busy}>{busy?t("Saving…"):t("Send request")}</button></form>
    </section>
    <details className="profile-editor"><summary><RecordAvatar name={profile.name} seed={profile.username} small /><span><strong>{profile.name}</strong><small>@{profile.username}</small></span><span className="profile-edit-label"><Pencil size={16} aria-hidden="true" /><T text={"Edit profile"} /></span></summary>
      <form onSubmit={async event=>{event.preventDefault();setBusy(true);setMessage("");setFailed(false);try{const updated=await api<Profile>("/api/profile",{name,username});setProfile(updated);setMessage("Profile saved. Share your username with friends.");}catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}}}><label htmlFor="profile-name"><T text={"Display name"} /></label><input id="profile-name" value={name} maxLength={40} required onChange={e=>setName(e.target.value)} autoComplete="nickname" disabled={busy}/><label htmlFor="username"><T text={"Username"} /></label><input id="username" value={username} minLength={3} maxLength={24} pattern="[a-z0-9_]+" required onChange={e=>setUsername(e.target.value.toLowerCase())} autoComplete="username" disabled={busy}/><p className="field-help"><T text={"3–24 lowercase letters, numbers or underscores."} /></p><button className="button outline-button" disabled={busy}>{busy?t("Saving…"):t("Save profile")}</button></form>
    </details></div>
  </main>;
}
