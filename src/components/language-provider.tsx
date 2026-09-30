"use client";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const control = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const languages = [{ value: "en", label: "English" }, { value: "fr", label: "Français" }] as const;

  useEffect(() => {
    if (!open) return;
    options.current[locale === "fr" ? 1 : 0]?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !control.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, locale]);

  return <div className="language-picker" ref={control}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => {
      if (event.key === "Escape" && open) {
        event.preventDefault(); setOpen(false); trigger.current?.focus();
      }
    }}>
    <button ref={trigger} className="language-control" type="button" aria-label={`${t("Language")}: ${locale === "fr" ? "Français" : "English"}`}
      title={t("Language")} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => setOpen(!open)}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); }
      }}>
      <span>{locale.toUpperCase()}</span><ChevronDown size={14} aria-hidden="true" />
    </button>
    {open && <div className="language-menu" id={menuId} role="menu" aria-label={t("Language")}
      onKeyDown={event => {
        const index = options.current.findIndex(option => option === document.activeElement);
        let next: number | undefined;
        if (event.key === "ArrowDown") next = (index + 1) % languages.length;
        if (event.key === "ArrowUp") next = (index + languages.length - 1) % languages.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = languages.length - 1;
        if (event.key.toLowerCase() === "e") next = 0;
        if (event.key.toLowerCase() === "f") next = 1;
        if (next !== undefined) { event.preventDefault(); options.current[next]?.focus(); }
      }}>
      {languages.map((language, index) => <button key={language.value} ref={element => { options.current[index] = element; }}
        className="language-option" type="button" role="menuitemradio" aria-checked={locale === language.value} lang={language.value} tabIndex={-1}
        onClick={() => { setLocale(language.value); setOpen(false); trigger.current?.focus(); }}>
        <span>{language.label}</span>{locale === language.value && <Check size={16} aria-hidden="true" />}
      </button>)}
    </div>}
  </div>;
}
