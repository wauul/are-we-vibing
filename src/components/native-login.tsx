"use client";
import { T, useLanguage } from "@/components/language-provider";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { api } from "@/lib/client-api";
export default function NativeLogin({ id }: { id: string }) {
  const { t } = useLanguage();
  const [name, setName] = useState<string>(); const [loaded, setLoaded] = useState(false); const [error, setError] = useState(""); const [returnUrl, setReturnUrl] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; void api<{ user: { name: string } | null }>("/api/profile").then(result => { if (active) setName(result.user?.name); }).catch(() => { if (active) setError("Could not check sign-in. Please refresh."); }).finally(() => { if (active) setLoaded(true); }); return () => { active = false; }; }, []);
  return <main id="content" className="flow-shell"><div className="detail-card"><h1><T text={"Sign in to Android"} /></h1><p><T text={"Only continue if you just tapped Google sign-in in the Are We Vibing Android app on this device."} /></p>{!loaded ? <p><T text={"Checking sign-in…"} /></p> : name ? <><p><T text={"You are signed in as"} /> {name}.</p><button className="button" disabled={busy} onClick={async () => { setBusy(true); try { const result = await api<{ url: string }>("/api/native-auth", { action: "approve", id }); setReturnUrl(result.url); window.location.href = result.url; } catch (e) { setError((e as Error).message); setBusy(false); } }}><T text={"Continue in Android"} /></button></> : <button className="button" onClick={() => void signIn("google", { callbackUrl: `/native-login/${id}` })}><T text={"Continue with Google"} /></button>}{returnUrl && <p><a className="button" href={returnUrl}><T text={"Open the Android app"} /></a></p>}{error && <p className="error" role="alert">{t(error)}</p>}</div></main>;
}
