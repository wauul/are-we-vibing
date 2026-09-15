import { api } from "./client-api";
import { APP_ORIGIN } from "./native-links";
export async function beginNativeSignIn() {
  const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const challenge = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const { id } = await api<{ id: string }>("/api/native-auth", { action: "begin", challenge });
  sessionStorage.setItem(`native-login:${id}`, verifier);
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url: `${APP_ORIGIN}/native-login/${id}` });
}
export async function finishNativeSignIn(value: string): Promise<boolean> {
  let url: URL;
  try { url = new URL(value); } catch { return false; }
  if (url.protocol !== "arewevibing:" || url.hostname !== "auth") return false;
  const id = url.searchParams.get("loginId");
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return false;
  const verifier = sessionStorage.getItem(`native-login:${id}`);
  if (!verifier) return false;
  await api("/api/native-auth", { action: "exchange", id, verifier });
  sessionStorage.removeItem(`native-login:${id}`);
  const { Browser } = await import("@capacitor/browser"); await Browser.close().catch(() => {});
  window.location.assign("/friends"); return true;
}
