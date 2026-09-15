"use client";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { api } from "@/lib/client-api";

export default function NativePush({ sessionId }: { sessionId: string }) {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let active = true;
    const removers: (() => Promise<void>)[] = [];
    void (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      if (!active) return;
      for (const promise of [
        PushNotifications.addListener("registration", async event => {
          try { const result = await api<{ enabled: boolean }>("/api/push-tokens", { sessionId, token: event.value });
            if (active) setNotice(result.enabled ? "We’ll notify you when your friend’s vibe is ready." : "Notifications are being connected. This page still updates live.");
          } catch { if (active) setNotice("Notifications couldn’t connect. Your session still works."); }
        }),
        PushNotifications.addListener("registrationError", () => { if (active) setNotice("Notifications unavailable. Keep your invite link to check back."); }),
      ]) { const h = await promise; if (active) removers.push(() => h.remove()); else await h.remove(); }
      await PushNotifications.createChannel({ id: "vibe-results", name: "Vibe results", importance: 4, visibility: 0 });
      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") permission = await PushNotifications.requestPermissions();
      if (!active) return;
      if (permission.receive === "granted") await PushNotifications.register();
      else setNotice("Notifications are off. Your link and live updates still work.");
    })().catch(() => { if (active) setNotice("Notifications unavailable on this device."); });
    return () => { active = false; removers.forEach(remove => void remove()); };
  }, [sessionId]);
  return notice ? <p className="micro" role="status">{notice}</p> : null;
}
