"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";

export type Profile = { id: string; name: string; username: string };

export function useAccountProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [authAvailable, setAuthAvailable] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoaded(false); setError("");
    api<{ user: Profile | null; authAvailable: boolean }>("/api/profile")
      .then(result => { if (!cancelled) { setProfile(result.user); setAuthAvailable(result.authAvailable); } })
      .catch(reason => { if (!cancelled) setError(reason.message); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [attempt]);
  return { profile, setProfile, loaded, authAvailable, error, retry: () => setAttempt(value => value + 1) };
}
