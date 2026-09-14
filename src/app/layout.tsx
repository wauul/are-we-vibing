import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines, ArrowUpRight } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./design.css";
import "./social.css";
import AccountNav from "@/components/account-nav";
export const metadata: Metadata = {
  title: "R We Vibing? — Find your musical chemistry",
  description: "Two people. Two music tastes. One very honest vibe check.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-icon">
              <AudioLines size={21} />
            </span>
            r we vibing<span className="orange">?</span>
          </Link>
          <nav className="header-actions"><AccountNav /><Link className="nav-link" href="/session/new">
            Find your frequency <ArrowUpRight size={16} />
          </Link></nav>
        </header>
        {children}
        <footer>
          <Link className="brand" href="/">
            r we vibing?
          </Link>
          <span>
            Made for the love of music. And a little friendly judgment.
          </span>
          <Link href="/privacy">Privacy</Link>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
