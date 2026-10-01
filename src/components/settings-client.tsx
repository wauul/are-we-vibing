"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronRight, FileText, Languages, LogOut, Mail, Moon, Pencil, Shield, Trash2 } from "lucide-react";
import LanguageControl, { useLanguage } from "./language-provider";
import ThemeControl from "./theme-control";
import RecordAvatar from "./record-avatar";
import { Feedback, LoadingState } from "./ui";
import { useAccountProfile } from "./account-profile";

export default function SettingsClient() {
  const { t } = useLanguage();
  const { profile, loaded, error, retry } = useAccountProfile();
  return <main id="content" className="account-shell settings-shell">
    <h1>{t("Settings")}</h1>
    <section className="settings-group" aria-labelledby="account-group">
      <h2 id="account-group">{t("Account")}</h2>
      {!loaded ? <LoadingState label={t("Loading your profile")} /> : error ? <><Feedback tone="error">{error}</Feedback><button className="text-button" onClick={retry}>{t("Try again")}</button></> : profile ?
        <Link className="settings-profile" href="/settings/profile"><RecordAvatar name={profile.name} seed={profile.username} small /><span><strong>{profile.name}</strong><small>@{profile.username}</small></span><span className="profile-edit-action"><Pencil size={16} aria-hidden="true" />{t("Edit profile")}<ChevronRight size={18} aria-hidden="true" /></span></Link> :
        <Link className="settings-row" href="/friends"><Pencil size={20} aria-hidden="true" /><span>{t("Sign in to manage your profile")}</span><ChevronRight size={18} aria-hidden="true" /></Link>}
    </section>
    <section className="settings-group" aria-labelledby="preferences-group"><h2 id="preferences-group">{t("Preferences")}</h2><div className="settings-rows">
      <div className="settings-row"><Languages size={20} aria-hidden="true" /><span>{t("Language")}</span><LanguageControl /></div>
      <div className="settings-row"><Moon size={20} aria-hidden="true" /><span>{t("Appearance")}</span><ThemeControl showLabel /></div>
    </div></section>
    <section className="settings-group" aria-labelledby="about-group"><h2 id="about-group">{t("About & support")}</h2><div className="settings-rows">
      <Link className="settings-row" href="/privacy"><Shield size={20} aria-hidden="true" /><span>{t("Privacy policy")}</span><ChevronRight size={18} aria-hidden="true" /></Link>
      <Link className="settings-row" href="/terms"><FileText size={20} aria-hidden="true" /><span>{t("Terms of Use")}</span><ChevronRight size={18} aria-hidden="true" /></Link>
      <a className="settings-row" href="mailto:waelfeza@gmail.com?subject=Are%20We%20Vibing%20support"><Mail size={20} aria-hidden="true" /><span>{t("Contact support")}</span><ChevronRight size={18} aria-hidden="true" /></a>
    </div></section>
    <section className="settings-group" aria-labelledby="account-actions-group"><h2 id="account-actions-group">{t("Account actions")}</h2><div className="settings-rows">
      {profile && <button className="settings-row" onClick={() => void signOut({ callbackUrl: "/" })}><LogOut size={20} aria-hidden="true" /><span>{t("Sign out")}</span><ChevronRight size={18} aria-hidden="true" /></button>}
      <Link className="settings-row destructive-row" href="/delete-account"><Trash2 size={20} aria-hidden="true" /><span>{t("Delete account")}</span><ChevronRight size={18} aria-hidden="true" /></Link>
    </div><p className="field-help">{t("Deletion requests are handled by email after ownership is verified.")}</p></section>
    <p className="settings-footnote">R We Vibing? · {t("Good music is better shared.")}</p>
  </main>;
}
