"use client";
import { useLanguage } from "@/components/language-provider";
import type { ReactNode } from "react";
import Link from "next/link";
import { AudioLines, Check, CircleAlert } from "lucide-react";

export function Brand() { return <span className="brand"><span className="brand-icon"><AudioLines size={22} aria-hidden="true" /></span><span>r we vibing<span className="brand-question">?</span></span></span>; }
export function Side({ side }: { side: "A" | "B" }) {
  const { t } = useLanguage(); return <span className={`side-marker side-${side.toLowerCase()}`} aria-label={t("Side {0}", {0:side})}>{side}</span>; }
export function Feedback({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" | "success" }) {
  const { t } = useLanguage();
  return <div className={`feedback feedback-${tone}`} role={tone === "error" ? "alert" : "status"}>
    {tone === "error" ? <CircleAlert size={18} aria-hidden="true" /> : tone === "success" ? <Check size={18} aria-hidden="true" /> : <AudioLines size={18} aria-hidden="true" />}<span>{typeof children === "string" ? t(children) : children}</span>
  </div>;
}
export function EmptyState({ title, children, href, action }: { title: string; children: ReactNode; href?: string; action?: string }) {
  const { t } = useLanguage();
  return <div className="empty-state"><h3>{t(title)}</h3><p>{typeof children === "string" ? t(children) : children}</p>{href && <Link className="button outline-button" href={href}>{action && t(action)}</Link>}</div>;
}
export function LoadingState({ label = "Loading your session" }: { label?: string }) {
  const { t } = useLanguage();
  return <div className="loading-state" role="status" aria-live="polite"><div className="loading-line" /><div className="loading-line short" /><p>{t(label)}</p></div>;
}
