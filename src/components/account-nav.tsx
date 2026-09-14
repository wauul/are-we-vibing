"use client";
import Link from "next/link";
import { Users } from "lucide-react";
export default function AccountNav() {
  return <Link className="nav-link friends-nav" href="/friends"><Users size={16} /> Friends & account</Link>;
}
