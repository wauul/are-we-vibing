"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Link2, ArrowUpRight, Sparkles, Music2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";
import type { SessionView } from "@/lib/schema";
import { api } from "./input-form";
import { SoundBars } from "./vibe-visual";
import ShareLink from "./share-link";
import ShareableResultCard from "./ShareableResultCard";
import ListenTogether from "./listen-together";
import { Capacitor } from "@capacitor/core";
const badges = {
  MANUAL: "via your own picks ♫",
  SPOTIFY: "via Spotify 🎧",
  YOUTUBE: "via YouTube ▶",
};
export default function ResultsClient({ id }: { id: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionView | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cardImage, setCardImage] = useState("");
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    api<SessionView>(`/api/sessions/${id}`)
      .then((s) => {
        if (cancelled) return;
        if (!s.resultJson) {
          router.replace(`/session/${id}`);
          return;
        }
        setSession(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);
  useEffect(() => {
    if (!session?.resultJson) return;
    const target = session.resultJson.compatibilityScore;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setScore(target);
      return;
    }
    let frame: number;
    const start = performance.now();
    function tick(t: number) {
      const p = Math.min((t - start) / 1500, 1);
      setScore(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
      else if (target > 80)
        void confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.65 },
          colors: ["#e76e3c", "#ecc76d", "#739288"],
          disableForReducedMotion: true,
        });
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [session]);
  async function download() {
    if (!card.current) return;
    setSaving(true);
    try {
      await Promise.all(Array.from(card.current.querySelectorAll("img")).map(img => img.decode().catch(() => {})));
      const url = await toPng(card.current, {
        pixelRatio: 2,
        backgroundColor: "#211d30",
        imagePlaceholder: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=",
      });
      setCardImage(url);
      if (Capacitor.isNativePlatform()) {
        const [{ Filesystem, Directory }, { Share }] = await Promise.all([import("@capacitor/filesystem"), import("@capacitor/share")]);
        const file = await Filesystem.writeFile({ path: "r-we-vibing.png", directory: Directory.Cache, data: url.split(",")[1] });
        await Share.share({ title: "Our vibe card", files: [file.uri] }).catch(() => {});
      } else {
        const a = document.createElement("a"); a.download = "r-we-vibing.png"; a.href = url; a.click();
      }
      setNotice("Your vibe card is ready for its group-chat debut.");
    } catch {
      setNotice(
        "Could not save the card. Try copying the result link instead.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (!session?.resultJson)
    return (
      <main className="flow-shell">
        <p role="status">{error || "Putting the needle on your result…"}</p>
        {error && (
          <Link href="/" className="button">
            Start again
          </Link>
        )}
      </main>
    );
  const r = session.resultJson;
  const genres = Array.from(
    new Set(
      [...r.personA.genres, ...r.personB.genres].map((g) => g.toLowerCase()),
    ),
  );
  const chart = genres.map((g) => ({
    genre: g,
    A: r.personA.genres.some((x) => x.toLowerCase() === g) ? 1 : 0,
    B: r.personB.genres.some((x) => x.toLowerCase() === g) ? 1 : 0,
  }));
  return (
    <main className="results-shell">
      <div className="result-heading">
        <div className="eyebrow">THE RESULTS ARE ON REPEAT</div>
        <h1>
          Your musical <span className="serif orange">chemistry.</span>
        </h1>
        <p>
          {session.personAName} + {session.personBName} · the official
          unofficial vibe check
        </p>
      </div>
      <div className="share-card">
        <div className="score-panel">
          <div className="eyebrow">R WE VIBING?</div>
          <div className="score-orbits" aria-hidden="true"><i /><i /><span>✦</span><b>✧</b></div>
          <div
            className="score"
            aria-label={`${r.compatibilityScore} percent compatibility`}
          >
            {score}
            <span>%</span>
          </div>
          <span className="score-label">{r.compatibilityScore > 80 ? "CERTIFIED AUX-CORD SOULMATES" : r.compatibilityScore >= 50 ? "THERE’S A FREQUENCY HERE" : "DIFFERENT WORLDS. FRESH DISCOVERIES."}</span>
          <SoundBars className="result-wave" />
          <h2>{r.verdict}</h2>
          <p className="micro">
            {session.personAName} × {session.personBName}
          </p>
        </div>
        <div className="person-grid">
          {[
            {
              key: "A",
              name: session.personAName,
              type: session.personAInputType,
              data: r.personA,
            },
            {
              key: "B",
              name: session.personBName,
              type: session.personBInputType!,
              data: r.personB,
            },
          ].map((p) => (
            <article key={p.key} className="person-card">
              <div className="person-top">
                <span className={`avatar avatar-${p.key}`}>
                  {p.name?.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h3>{p.name}</h3>
                  <small>{badges[p.type]}</small>
                </div>
              </div>
              <p>{p.data.vibeSummary}</p>
              <div className="genre-tags">
                {p.data.genres.map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="card-brand">
          r we vibing? <span>TWO TASTES. ONE FREQUENCY.</span>
        </div>
      </div>
      <div className="visual-card-preview"><ShareableResultCard ref={card} session={session} /></div>
      <div className="result-actions">
        <button className="button" onClick={download} disabled={saving}>
          <Download size={17} />
          {saving ? "Making your card…" : "Save vibe card"}
        </button>
        <ShareLink path={`/results/${id}`} text="Our musical chemistry is in. R We Vibing?" compact />
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {cardImage && (
        <details className="notice" open>
          <summary>Your shareable image — save it below if the download did not start.</summary>
          {/* A visible image also supports browsers that suppress automatic downloads. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardImage} alt="Your generated music compatibility card" style={{ maxWidth: "100%", height: "auto", marginTop: 16 }} />
        </details>
      )}
      <ListenTogether tracks={session.playlist || []} />
      <div className="result-detail-grid">
        <section className="detail-card">
          <div className="eyebrow">THE CROSSOVER EPISODE</div>
          <h2>Where your worlds meet</h2>
          <p className="field-help">
            Genres inferred by AI. Bars indicate presence, not measured
            intensity.
          </p>
          <div
            className="chart"
            role="img"
            aria-label={`Inferred genres. ${session.personAName}: ${r.personA.genres.join(", ")}. ${session.personBName}: ${r.personB.genres.join(", ")}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis
                  type="category"
                  dataKey="genre"
                  width={100}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    value ? "Present" : "Not inferred",
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="A"
                  name={session.personAName}
                  fill="#e9794c"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="B"
                  name={session.personBName!}
                  fill="#739288"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="detail-card">
          <div className="eyebrow">ADD TO YOUR SHARED ROTATION</div>
          <h2>Your next {r.recommendations.length} favorites</h2>
          <div className="recommendations">
            {r.recommendations.map((track, i) => (
              <a
                key={track}
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="track-number">{String(i + 1).padStart(2, "0")}</span>
                <Music2 size={18} />
                <span>{track}</span>
                <ArrowUpRight size={17} />
              </a>
            ))}
          </div>
          <p className="field-help">
            AI-picked songs to explore together. Links open YouTube search.
          </p>
        </section>
      </div>
      <section className="awards">
        {r.superlatives.map((s, i) => (
          <article key={i}>
            <Sparkles size={23} />
            <div>
              <div className="eyebrow">THE UNOFFICIAL AWARDS</div>
              <h3>{s.title}</h3>
              <p>
                Goes to{" "}
                {s.person === "A" ? session.personAName : session.personBName}
              </p>
            </div>
          </article>
        ))}
      </section>
      <p className="results-disclaimer">
        A playful AI interpretation of your music, not a scientific
        compatibility test.
      </p>
      <Link className="another-session" href="/session/new">
        Different friend. Different frequency. Try again ↗
      </Link>
    </main>
  );
}
