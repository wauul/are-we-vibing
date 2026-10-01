"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import { UserPlus } from "lucide-react";
import { nativeGoogleSignIn } from "@/lib/native-google";
import { api } from "@/lib/client-api";
import AccountHeading from "./account-heading";
import UsernameCard from "./username-card";
import { useAccountProfile } from "./account-profile";
import { Feedback, LoadingState } from "./ui";
import { useLanguage } from "./language-provider";

export default function AddFriend() {
  const { t } = useLanguage();
  const { profile, loaded, authAvailable, error, retry } = useAccountProfile();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { setUsername(new URLSearchParams(window.location.search).get("username")?.slice(0, 25).replace(/^@/, "").toLowerCase() || ""); }, []);
  return <main id="content" className="account-shell">
    <AccountHeading title="Add a friend" back="/friends" backLabel="Music circle" />
    {!loaded ? <LoadingState label={t("Loading your profile")} /> : error ? <><Feedback tone="error">{error}</Feedback><button className="text-button" onClick={retry}>{t("Try again")}</button></> : !profile ? <div className="friend-intro">
      <UserPlus size={44} aria-hidden="true" /><h2>{t("Sign in to add friends")}</h2><p>{t("Keep your people and shared mixes together.")}</p>
      {message && <Feedback tone="error">{message}</Feedback>}
      {!authAvailable && <Feedback>{t("Google sign-in is unavailable here. You can still start a guest session.")}</Feedback>}
      <button className="button" disabled={busy || !authAvailable} onClick={async () => {
        setBusy(true); setMessage("");
        try { if (Capacitor.isNativePlatform()) await nativeGoogleSignIn(`/friends/add?username=${encodeURIComponent(username)}`); else await signIn("google", { callbackUrl: `/friends/add?username=${encodeURIComponent(username)}` }); }
        catch { setBusy(false); setMessage(t("Google sign-in couldn’t open. Please try again.")); }
      }}>{busy ? t("Opening Google…") : t("Continue with Google")}</button>
    </div> : <>
      <p className="account-description">{t("Find your people by their username. No contacts access needed.")}</p>
      {sent ? <div className="friend-sent"><Feedback tone="success">{t("Request sent to @{0}.", { 0: sent })}</Feedback><p>{t("They’ll need to accept your request.")}</p><Link className="button" href="/friends">{t("Back to your music circle")}</Link><button className="text-button" onClick={() => { setSent(""); setUsername(""); }}>{t("Add another friend")}</button></div> :
        <form className="account-form" onSubmit={async event => {
          event.preventDefault(); if (busy) return;
          const target = username.replace(/^@/, "").trim().toLowerCase();
          if (target === profile.username) { setMessage(t("That is your username. Enter your friend’s username instead.")); return; }
          setBusy(true); setMessage("");
          try { await api("/api/friends", { action: "add", username: target }); setSent(target); }
          catch (reason) { setMessage((reason as Error).message); }
          finally { setBusy(false); }
        }}>
          <label htmlFor="friend-username">{t("Their username")}</label><input id="friend-username" placeholder="@username" value={username} minLength={3} maxLength={25} pattern="@?[a-z0-9_]{3,24}" required onChange={event => { setUsername(event.target.value.toLowerCase()); setMessage(""); }} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-describedby="friend-help" disabled={busy} />
          <p className="field-help" id="friend-help">{t("Ask your friend for the username shown in their music circle.")}</p>
          {message && <Feedback tone="error">{message}</Feedback>}
          <button className="button" disabled={busy || !username.trim()}><UserPlus size={18} aria-hidden="true" />{busy ? t("Sending…") : t("Send request")}</button>
        </form>}
      <div className="share-username-section"><h2>{t("Let friends find you")}</h2><p>{t("Send your username or a friend link.")}</p><UsernameCard username={profile.username} /></div>
    </>}
  </main>;
}
