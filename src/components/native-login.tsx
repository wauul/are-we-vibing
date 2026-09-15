"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { api } from "@/lib/client-api";
export default function NativeLogin({ id }: { id: string }) {
  const [name, setName] = useState<string>(); const [loaded, setLoaded] = useState(false); const [error, setError] = useState(""); const [returnUrl, setReturnUrl] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; void api<{ user: { name: string } | null }>("/api/profile").then(result => { if (active) setName(result.user?.name); }).catch(() => { if (active) setError("Could not check sign-in. Please refresh."); }).finally(() => { if (active) setLoaded(true); }); return () => { active = false; }; }, []);
  return <main className="flow-shell"><div className="detail-card"><div className="eyebrow">BACK TO YOUR MUSIC CIRCLE</div><h1>Sign in to Android</h1><p>Only continue if you just tapped Google sign-in in the Are We Vibing Android app on this device.</p>{!loaded ? <p>Checking sign-in…</p> : name ? <><p>Continue as {name}?</p><button className="button" disabled={busy} onClick={async () => { setBusy(true); try { const result = await api<{ url: string }>("/api/native-auth", { action: "approve", id }); setReturnUrl(result.url); window.location.href = result.url; } catch (e) { setError((e as Error).message); setBusy(false); } }}>Continue in Android</button></> : <button className="button" onClick={() => void signIn("google", { callbackUrl: `/native-login/${id}` })}>Continue with Google</button>}{returnUrl && <p><a className="button" href={returnUrl}>Open the Android app</a></p>}{error && <p role="alert">{error}</p>}</div></main>;
}
