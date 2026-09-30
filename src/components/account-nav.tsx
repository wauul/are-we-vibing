"use client";
import { T, useLanguage } from "@/components/language-provider";

import Link from "next/link";
import { Users } from "lucide-react";
export default function AccountNav() {
  const { t } = useLanguage();
  return <Link className="nav-link friends-nav" href="/friends" aria-label={t("Music circle")}><Users size={18} aria-hidden="true" /><span><T text={"Music circle"} /></span></Link>;
}
