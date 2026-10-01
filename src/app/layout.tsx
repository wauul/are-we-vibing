import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { themeBootstrap } from "@/lib/theme";
import { LanguageProvider } from "@/components/language-provider";
import { SiteHeader, SiteFooter, MobileNavigation } from "@/components/site-chrome";
import { localeCookie, validLocale } from "@/lib/i18n";
import NativeRuntime from "@/components/native-runtime";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
const display = localFont({ src: "./fonts/BricolageGrotesque.ttf", variable: "--font-display", display: "swap" });
const body = localFont({ src: "./fonts/Manrope.ttf", variable: "--font-body", display: "swap" });
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f3f3ef" };
export const metadata: Metadata = {
  title: "R We Vibing? — Compare your music taste",
  description: "Compare music with someone you know. Get a playful compatibility result and songs to explore together.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const savedLocale = (await cookies()).get(localeCookie)?.value;
  const locale = validLocale(savedLocale) ? savedLocale : "en";
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body>
        <LanguageProvider initialLocale={locale}>
        <NativeRuntime />
        <SiteHeader />
        {children}
        <Analytics />
        <SpeedInsights />
        <SiteFooter />
        <MobileNavigation />
        </LanguageProvider>
      </body>
    </html>
  );
}
