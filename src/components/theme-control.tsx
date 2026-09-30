"use client";
import { useLanguage } from "@/components/language-provider";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { themeKey } from "@/lib/theme";
type Theme = "light" | "dark" | "system";

export default function ThemeControl() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("system");
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const saved = localStorage.getItem(themeKey); if (saved === "light" || saved === "dark") setTheme(saved); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() {
      const isDark = theme === "dark" || (theme === "system" && preference.matches);
      setDark(isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#171719" : "#f3f3ef");
      if (Capacitor.isNativePlatform()) void SystemBars.setStyle({ style: isDark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
    }
    apply(); preference.addEventListener("change", apply);
    return () => preference.removeEventListener("change", apply);
  }, [theme, ready]);
  const Icon = dark ? Moon : Sun;
  return <button className="theme-toggle icon-button" type="button" aria-label={t("Dark mode")} aria-pressed={dark} title={dark ? t("Switch to light mode") : t("Switch to dark mode")} onClick={() => {
    const next = dark ? "light" : "dark";
    setTheme(next); try { localStorage.setItem(themeKey, next); } catch {}
  }}><Icon size={20} aria-hidden="true" /></button>;
}
