import french from "./translations-fr.json";
export type Locale = "en" | "fr";
export const localeKey = "vibing:language";
export const localeCookie = "vibing-language";
export function validLocale(value: unknown): value is Locale { return value === "en" || value === "fr"; }
export function translate(locale: Locale, text: string, values: Record<string, string | number | null | undefined> = {}) {
  const copy = locale === "fr" ? (french as Record<string, string>)[text] ?? text : text;
  return copy.replace(/\{(\w+)\}/g, (match, key: string) => key in values ? String(values[key] ?? "") : match);
}
