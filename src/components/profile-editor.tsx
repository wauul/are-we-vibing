"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccountProfile, type Profile } from "./account-profile";
import AccountHeading from "./account-heading";
import RecordAvatar from "./record-avatar";
import { Feedback, LoadingState } from "./ui";
import { api } from "@/lib/client-api";
import { useLanguage } from "./language-provider";

export default function ProfileEditor() {
  const { t } = useLanguage();
  const { profile, setProfile, loaded, error, retry } = useAccountProfile();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (profile) { setName(profile.name); setUsername(profile.username); } }, [profile]);
  const changed = profile && (name.trim() !== profile.name || username.trim() !== profile.username);
  return <main id="content" className="account-shell">
    <AccountHeading title="Edit profile" back="/settings" backLabel="Settings" />
    {!loaded ? <LoadingState label={t("Loading your profile")} /> : error ? <><Feedback tone="error">{error}</Feedback><button className="text-button" onClick={retry}>{t("Try again")}</button></> : !profile ? <Link className="button" href="/friends">{t("Continue with Google")}</Link> : <>
      <div className="profile-preview"><RecordAvatar name={name || profile.name} seed={username || profile.username} /><p>{t("Friends see your name and username, never your email.")}</p></div>
      <form className="account-form" onSubmit={async event => {
        event.preventDefault(); if (busy) return;
        setBusy(true); setMessage(""); setFailed(false);
        try { const updated = await api<Profile>("/api/profile", { name: name.trim(), username: username.trim() }); setProfile(updated); setMessage(t("Profile saved. Share your username with friends.")); }
        catch (reason) { setFailed(true); setMessage((reason as Error).message); }
        finally { setBusy(false); }
      }}>
        <label htmlFor="profile-name">{t("Display name")}</label><input id="profile-name" value={name} maxLength={40} required onChange={event => { setName(event.target.value); setMessage(""); }} autoComplete="nickname" disabled={busy} />
        <label htmlFor="profile-username">{t("Username")}</label><input id="profile-username" value={username} minLength={3} maxLength={24} pattern="[a-z0-9_]+" required onChange={event => { setUsername(event.target.value.toLowerCase()); setMessage(""); }} autoComplete="username" autoCapitalize="none" spellCheck={false} aria-describedby="username-help" disabled={busy} />
        <p className="field-help" id="username-help">{t("3–24 lowercase letters, numbers or underscores.")}</p>
        {message && <Feedback tone={failed ? "error" : "success"}>{message}</Feedback>}
        <div className="account-form-actions"><button className="button" disabled={busy || !changed}>{busy ? t("Saving…") : t("Save profile")}</button><Link className="text-button" href="/settings">{t("Back to settings")}</Link></div>
      </form>
    </>}
  </main>;
}
