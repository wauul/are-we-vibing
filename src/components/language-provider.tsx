"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { localeCookie, localeKey, translate, validLocale, type Locale } from "@/lib/i18n";
type LanguageContext = { locale: Locale; setLocale: (locale: Locale) => void; t: (text: string, values?: Record<string, string | number | null | undefined>) => string };
const Language = createContext<LanguageContext>({ locale: "en", setLocale: () => {}, t: text => text });
export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, updateLocale] = useState(initialLocale);
  const setLocale = useCallback((next: Locale) => {
    updateLocale(next);
    document.documentElement.lang = next;
    try { localStorage.setItem(localeKey, next); } catch {}
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }, []);
  useEffect(() => {
    try { const saved = localStorage.getItem(localeKey); if (validLocale(saved) && saved !== initialLocale) setLocale(saved); } catch {}
  }, [initialLocale, setLocale]);
  const t = useCallback((text: string, values?: Record<string, string | number | null | undefined>) => translate(locale, text, values), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <Language.Provider value={value}>{children}</Language.Provider>;
}
export function useLanguage() { return useContext(Language); }
export function T({ text }: { text: string }) { const { t } = useLanguage(); return <>{t(text)}</>; }
export default function LanguageControl() {
  const { locale, setLocale, t } = useLanguage();
  return <select className="language-control" aria-label={t("Language")} title={t("Language")} value={locale} onChange={event => { if (validLocale(event.target.value)) setLocale(event.target.value); }}>
    <option value="en" lang="en" aria-label="English">EN</option><option value="fr" lang="fr" aria-label="Français">FR</option>
  </select>;
}
