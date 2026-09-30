"use client";
import Link from "next/link";
import { Brand } from "./ui";
import AccountNav from "./account-nav";
import ThemeControl from "./theme-control";
import AppMotion from "./app-motion";
import LanguageControl, { useLanguage } from "./language-provider";
export function SiteHeader() {
  const { t } = useLanguage();
  return <><a className="skip-link" href="#content">{t("Skip to content")}</a><header className="site-header">
    <Link href="/" aria-label={t("R We Vibing home")}><Brand /></Link>
    <nav className="header-actions" aria-label={t("Main navigation")}><AccountNav /><LanguageControl /><ThemeControl /><AppMotion /><Link className="button header-start" href="/session/new">{t("New session")}</Link></nav>
  </header></>;
}
export function SiteFooter() {
  const { t } = useLanguage();
  return <footer><Link href="/"><Brand /></Link><span>{t("Good music is better shared.")}</span><nav aria-label={t("Legal")}><Link href="/privacy">{t("Privacy")}</Link><Link href="/terms" aria-label={t("Terms of Use")}>{t("Terms")}</Link></nav></footer>;
}
