"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";
import { useLanguage } from "./language-provider";
import { api } from "@/lib/client-api";

type Playlist = { id: string; title: string; count: number; privacy: string };
type PlaylistResponse = { status: "signed-out" | "connect" | "connected" | "unavailable"; playlists: Playlist[]; nextPageToken?: string };
export default function YouTubePlaylistPicker({ value, onChange, disabled, beforeConnect }: {
  value: string; onChange: (value: string) => void; disabled: boolean; beforeConnect: () => void;
}) {
  const { t } = useLanguage();
  const [data, setData] = useState<PlaylistResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function load(pageToken?: string) {
    setLoading(true); setError("");
    try {
      const result = await api<PlaylistResponse>(`/api/youtube/playlists${pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : ""}`);
      setData(previous => pageToken && result.status === "connected" ? { ...result, playlists: [...(previous?.playlists || []), ...result.playlists] } : result);
    } catch { setData({ status: "unavailable", playlists: [] }); }
    finally { setLoading(false); }
  }
  useEffect(() => { let active = true;
    void api<PlaylistResponse>("/api/youtube/playlists").then(result => { if (active) setData(result); })
      .catch(() => { if (active) setData({ status: "unavailable", playlists: [] }); });
    return () => { active = false; };
  }, []);
  async function connect() {
    setLoading(true); setError("");
    try {
      beforeConnect();
      if (Capacitor.isNativePlatform()) {
        const { connectNativeYouTube } = await import("@/lib/native-google");
        await connectNativeYouTube(); await load();
      } else {
        const { url } = await api<{ url: string }>("/api/youtube/connect", { action: "begin", returnPath: window.location.pathname + window.location.search });
        window.location.assign(url);
      }
    } catch { setError("YouTube could not connect. Try again or paste a playlist link."); setLoading(false); }
  }
  const selectedId = (() => { try { return new URL(value).searchParams.get("list") || ""; } catch { return ""; } })();
  return <div className="youtube-library" aria-busy={loading || !data}>
    <div className="library-heading"><strong>{t("Your YouTube playlists")}</strong>
      {data?.status === "connected" && <button type="button" className="text-button" disabled={disabled || loading} onClick={() => void load()}>{t("Refresh")}</button>}
    </div>
    {!data ? <p className="field-help" role="status">{t("Loading playlists…")}</p>
      : data.status === "signed-out" ? <p className="field-help">{t("Sign in with Google to select your playlists.")} <Link href="/friends">{t("Sign in")}</Link></p>
      : data.status === "connect" ? <><p className="field-help">{t("Allow read-only YouTube access to choose a playlist from your account.")}</p><button type="button" className="button outline-button" disabled={disabled || loading} onClick={connect}>{t("Connect YouTube")}</button></>
      : data.status === "unavailable" ? <><p className="field-help" role="status">{t("YouTube playlists are unavailable. Try again or paste a public playlist link.")}</p><button type="button" className="text-button" disabled={disabled || loading} onClick={() => void load()}>{t("Try again")}</button></>
      : <>{data.playlists.length ? <><label htmlFor="youtube-library-select" className="sr-only">{t("Choose a playlist")}</label><select id="youtube-library-select" value={data.playlists.some(p => p.id === selectedId) ? selectedId : ""} disabled={disabled || loading} onChange={event => { if (event.target.value) onChange(`https://www.youtube.com/playlist?list=${event.target.value}`); }}>
        <option value="">{t("Choose a playlist")}</option>{data.playlists.map(p => <option key={p.id} value={p.id}>{p.title} · {t("{0} videos", { 0: p.count })}{p.privacy === "private" ? ` · ${t("Private")}` : ""}</option>)}</select>
        <p className="field-help">{t("Only the first 20 available videos are imported. Your chosen songs are used for the shared result.")}</p></> : <p className="field-help">{t("No playlists found in this YouTube account. You can still paste a playlist link.")}</p>}
        {data.nextPageToken && <button type="button" className="text-button" disabled={disabled || loading} onClick={() => void load(data.nextPageToken)}>{t("Load more playlists")}</button>}
        <button type="button" className="text-button" disabled={disabled || loading} onClick={async () => {
          setLoading(true);
          try { await api("/api/youtube/connect", { action: "disconnect" }); setData({ status: "connect", playlists: [] }); }
          catch { setError("YouTube could not disconnect. Try again."); }
          finally { setLoading(false); }
        }}>{t("Disconnect YouTube")}</button>
      </>}
    {error && <p className="error" role="alert">{t(error)}</p>}
  </div>;
}
