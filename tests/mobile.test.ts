import test from "node:test";
import assert from "node:assert/strict";
import { storedResultSchema, resultSchema } from "../src/lib/schema";
import { hashCreatorSecret, hasCreatorProof } from "../src/lib/creator-proof";
import { appLinkPath } from "../src/lib/native-links";
import { findSharedPlaylist } from "../src/lib/youtube-playlist";
import { nextPlayableIndex } from "../src/lib/youtube-player";
const result = { personA: { genres: ["pop"], vibeSummary: "Bright" }, personB: { genres: ["pop"], vibeSummary: "Warm" }, compatibilityScore: 80, verdict: "A match", recommendations: ["A", "B", "C"], superlatives: [{ title: "DJ", person: "A" }, { title: "Singer", person: "B" }] };
test("legacy results remain readable while new AI must supply ten tracks", () => {
  assert.equal(storedResultSchema.safeParse(result).success, true);
  assert.equal(resultSchema.safeParse(result).success, false);
  assert.equal(resultSchema.safeParse({ ...result, recommendations: Array.from({ length: 10 }, (_, i) => `Song ${i}`) }).success, true);
});
test("public session IDs cannot substitute for a private creator proof", () => {
  const hash = hashCreatorSecret("private-cookie-secret");
  assert.equal(hasCreatorProof(hash, "private-cookie-secret"), true);
  assert.equal(hasCreatorProof(hash, "public-session-id"), false);
  assert.equal(hasCreatorProof(null, "anything"), false);
});
test("native links reject foreign origins and non-result navigation", () => {
  const path = "/results/4587b796-7917-45c4-bd4e-b1dea4facb2d";
  assert.equal(appLinkPath("https://are-we-vibing.vercel.app" + path), path);
  for (const url of ["javascript:alert(1)", "https://evil.com" + path, "https://are-we-vibing.vercel.app.evil.com" + path, "https://are-we-vibing.vercel.app/api/auth/signout"]) assert.equal(appLinkPath(url), null);
});
test("failed embedded tracks skip forward and terminate without an error loop", () => {
  assert.equal(nextPlayableIndex(0, 4, new Set([0, 1])), 2);
  assert.equal(nextPlayableIndex(3, 4, new Set([3])), null);
});
test("YouTube matches preserve order, cap ten searches and tolerate partial failure", async () => {
  const original = global.fetch; const key = process.env.YOUTUBE_API_KEY; process.env.YOUTUBE_API_KEY = "test"; let calls = 0;
  global.fetch = async input => { const url = new URL(String(input)); calls++;
    assert.equal(url.hostname, "www.googleapis.com"); assert.equal(url.searchParams.get("videoEmbeddable"), "true");
    const q = Number(url.searchParams.get("q"));
    if (q === 2) throw new Error("quota");
    return new Response(JSON.stringify({ items: [{ id: { videoId: q < 2 ? "aaaaaaaaaaa" : `track${String(q).padStart(6, "0")}` }, snippet: { title: `Song ${q}` } }] }));
  };
  try { const tracks = await findSharedPlaylist(Array.from({ length: 15 }, (_, i) => String(i))); assert.equal(calls, 10); assert.equal(tracks.length, 8); assert.equal(tracks[1].title, "Song 3"); }
  finally { global.fetch = original; if (key) process.env.YOUTUBE_API_KEY = key; else delete process.env.YOUTUBE_API_KEY; }
});
test("total YouTube failure returns text-only fallback without throwing", async () => {
  const original = global.fetch; process.env.YOUTUBE_API_KEY = "test";
  global.fetch = async () => new Response("quota", { status: 403 });
  try { assert.deepEqual(await findSharedPlaylist(["one", "two"]), []); }
  finally { global.fetch = original; delete process.env.YOUTUBE_API_KEY; }
});
