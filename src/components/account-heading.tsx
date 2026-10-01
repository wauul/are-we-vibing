"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "./language-provider";

export default function AccountHeading({ title, back, backLabel }: { title: string; back: string; backLabel: string }) {
  const { t } = useLanguage();
  return <div className="account-heading">
    <Link className="back-link" href={back}><ArrowLeft size={20} aria-hidden="true" />{t(backLabel)}</Link>
    <h1>{t(title)}</h1>
  </div>;
}
