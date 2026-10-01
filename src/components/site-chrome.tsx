"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Settings, Users } from "lucide-react";
import { Brand } from "./ui";
import AccountNav from "./account-nav";
import ThemeControl from "./theme-control";
import AppMotion from "./app-motion";
import LanguageControl, { useLanguage } from "./language-provider";
export function SiteHeader() {
  const { t } = useLanguage();
  return <><a className="skip-link" href="#content">{t("Skip to content")}</a><header className="site-header">
    <Link href="/" aria-label={t("R We Vibing home")}><Brand /></Link>
    <nav className="header-actions" aria-label={t("Main navigation")}><AccountNav /><div className="header-preferences"><LanguageControl /><ThemeControl /></div><Link className="nav-link settings-nav" href="/settings"><Settings size={18} aria-hidden="true" />{t("Settings")}</Link><AppMotion /><Link className="button header-start" href="/session/new">{t("New session")}</Link></nav>
  </header></>;
}
export function SiteFooter() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const accountPage = pathname.startsWith("/settings") || pathname.startsWith("/friends") || ["/privacy", "/terms", "/delete-account"].includes(pathname);
  return <footer className={accountPage ? "account-footer" : undefined}><Link href="/"><Brand /></Link><span>{t("Good music is better shared.")}</span><nav aria-label={t("Legal")}><Link href="/privacy">{t("Privacy")}</Link><Link href="/terms" aria-label={t("Terms of Use")}>{t("Terms")}</Link><Link href="/delete-account">{t("Delete account")}</Link></nav></footer>;
}
export function MobileNavigation() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const links = [
    { href: "/", label: t("Home"), icon: Home, active: pathname === "/" },
    { href: "/session/new", label: t("New session"), icon: Plus, active: pathname.startsWith("/session/") || pathname.startsWith("/results/") },
    { href: "/friends", label: t("Friends"), icon: Users, active: pathname.startsWith("/friends") },
    { href: "/settings", label: t("Settings"), icon: Settings, active: pathname.startsWith("/settings") || ["/privacy", "/terms", "/delete-account"].includes(pathname) },
  ];
  return <nav className="mobile-navigation" aria-label={t("Main navigation")}>{links.map(link => <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}>
    <link.icon size={22} aria-hidden="true" /><span>{link.label}</span>
  </Link>)}</nav>;
}
