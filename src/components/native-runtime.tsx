"use client";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/navigation";
import { appLinkPath } from "@/lib/native-links";

export default function NativeRuntime() {
  const router = useRouter();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return; // No native listeners, permission prompts, or FCM calls in browsers.
    let cancelled = false;
    const cleanup: (() => Promise<void>)[] = [];
    void (async () => {
      const [{ App }, { PushNotifications }, { SplashScreen }] = await Promise.all([
        import("@capacitor/app"), import("@capacitor/push-notifications"), import("@capacitor/splash-screen"),
      ]);
      if (cancelled) return;
      const navigate = (url: unknown) => {
        const path = appLinkPath(url); if (path) router.push(path);
        else if (typeof url === "string" && url.startsWith("arewevibing://auth")) void import("@/lib/native-auth").then(m => m.finishNativeSignIn(url)).catch(() => router.push("/friends?error=native"));
      };
      const listen = async (promise: Promise<{ remove: () => Promise<void> }>) => {
        const handle = await promise; if (cancelled) await handle.remove(); else cleanup.push(() => handle.remove());
      };
      await listen(App.addListener("appUrlOpen", event => navigate(event.url)));
      await listen(PushNotifications.addListener("pushNotificationActionPerformed", event => navigate(event.notification.data?.url)));
      await listen(App.addListener("appStateChange", event => { if (!event.isActive) window.dispatchEvent(new Event("vibe:pause-player")); }));
      await listen(App.addListener("backButton", event => { if (event.canGoBack) window.history.back(); else void App.minimizeApp(); }));
      const launch = await App.getLaunchUrl(); if (launch) navigate(launch.url);
      await SplashScreen.hide();
    })().catch(() => console.warn("Optional native integration unavailable"));
    return () => { cancelled = true; cleanup.forEach(remove => void remove()); };
  }, [router]);
  return null;
}
