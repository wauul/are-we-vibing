"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Feedback } from "@/components/ui";

export default function ReviewLogin() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main id="content" className="flow-shell"><section className="detail-card">
    <h1>Review access</h1><p>Sign in to the dedicated review profile with its sample friend.</p>
    <form onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        const result = await signIn("play-review", { password, redirect: false, callbackUrl: "/friends" });
        if (result?.ok) window.location.assign("/friends");
        else { setError("Review sign-in failed. Check the review password."); setBusy(false); }
      } catch { setError("Sign-in could not finish. Please try again."); setBusy(false); }
    }}>
      <label htmlFor="review-password">Review password</label>
      <input id="review-password" type="password" autoComplete="current-password" maxLength={256} value={password} required disabled={busy} onChange={event => setPassword(event.target.value)} />
      {error && <Feedback tone="error">{error}</Feedback>}
      <button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in to review"}</button>
    </form>
  </section></main>;
}
