import test from "node:test";
import assert from "node:assert/strict";
import { parseSpotifyEmbed, readSpotifyPlaylist } from "../src/lib/spotify-playlist";
import { normalizeInput, playlistId } from "../src/lib/normalize";
import { analyze } from "../src/lib/ai";

const id = "37i9dQZF1DXcBWIGoYBM5M";
function track(index: number, title = `Song ${index}`, subtitle = "Artist") {
  return { uri: `spotify:track:${String(index).padStart(22, "0")}`, title, subtitle };
}
function embed(tracks: unknown[], entityId = id, type = "playlist") {
  return `<html><script type="application/json" nonce="example" id="__NEXT_DATA__">${JSON.stringify({
    props: { pageProps: { state: { data: { entity: { id: entityId, type, trackList: tracks } } } } },
  })}</script></html>`;
}
function htmlResponse(body: string) {
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

test("Spotify embed preserves artist commas and Unicode, removes duplicate songs, and bounds input", () => {
  const first = track(1, " Déjà vu ", " Artist A, Artist B ");
  const tracks = [first, first, track(2, "Déjà vu", "Artist A, Artist B"), null,
    { uri: "spotify:episode:0000000000000000000001", title: "Podcast", subtitle: "Host" },
    { ...track(3), subtitle: " " }, ...Array.from({ length: 30 }, (_, i) => track(i + 4))];
  const result = parseSpotifyEmbed(embed(tracks), id);
  assert.equal(result.length, 20);
  assert.equal(result[0], "Artist A, Artist B — Déjà vu");
  assert.equal(result[1], "Artist — Song 4");
  assert.equal(parseSpotifyEmbed(embed([track(1, "x".repeat(500))]), id)[0].length, 250);
});

test("Spotify embed rejects changed payloads, non-playlists, mismatched IDs and empty tracks", () => {
  for (const html of ["<html>Log in</html>", '<script id="__NEXT_DATA__">{bad json}</script>',
    embed([track(1)], "different"), embed([track(1)], id, "album"), embed([]),
    embed([{ title: "Song", subtitle: "Artist" }]), embed([track(1)]).replace('id="__NEXT_DATA__"', 'data-id="__NEXT_DATA__"')]) {
    assert.throws(() => parseSpotifyEmbed(html, id), /could not read/);
  }
});

test("Spotify input uses a fixed anonymous embed URL without forwarding user query parameters", async () => {
  const original = global.fetch;
  let calls = 0;
  global.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), `https://open.spotify.com/embed/playlist/${id}`);
    assert.equal(init?.credentials, "omit");
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    const headers = new Headers(init?.headers);
    assert.equal(headers.has("Authorization"), false);
    assert.equal(headers.has("Cookie"), false);
    return htmlResponse(embed([track(1)]));
  };
  try {
    assert.deepEqual(await normalizeInput("SPOTIFY", `https://open.spotify.com/playlist/${id}?si=private-share-value`), ["Artist — Song 1"]);
    assert.equal(calls, 1);
    assert.equal(playlistId("SPOTIFY", `https://open.spotify.com/embed/playlist/${id}`), id);
    assert.equal(playlistId("SPOTIFY", `https://open.spotify.com/intl-fr/playlist/${id}`), id);
    await assert.rejects(() => readSpotifyPlaylist("../evil"), /could not read/);
    assert.equal(calls, 1);
  } finally { global.fetch = original; }
});

test("Spotify lookup returns actionable errors for unavailable playlists, rate limits and network failures", async () => {
  const original = global.fetch;
  try {
    for (const status of [403, 404, 500]) {
      global.fetch = async () => new Response("Unavailable", { status });
      await assert.rejects(() => readSpotifyPlaylist(id), /Make sure it is public/);
    }
    global.fetch = async () => new Response("Busy", { status: 429 });
    await assert.rejects(() => readSpotifyPlaylist(id), /Spotify is busy/);
    global.fetch = async () => { throw new DOMException("Timeout", "TimeoutError"); };
    await assert.rejects(() => readSpotifyPlaylist(id), /My picks/);
    global.fetch = async () => new Response("{}", { headers: { "Content-Type": "application/json" } });
    await assert.rejects(() => readSpotifyPlaylist(id), /could not read/);
  } finally { global.fetch = original; }
});

test("Spotify lookup stops oversized responses with or without a declared length", async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => new Response("small", { headers: { "Content-Type": "text/html", "Content-Length": "3000000" } });
    await assert.rejects(() => readSpotifyPlaylist(id), /could not read/);
    global.fetch = async () => htmlResponse("x".repeat(2 * 1024 * 1024 + 1));
    await assert.rejects(() => readSpotifyPlaylist(id), /could not read/);
  } finally { global.fetch = original; }
});

test("imported Spotify songs enter the existing vibe check with another participant's picks", async () => {
  const original = global.fetch;
  const previousKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "test-only";
  const result = {
    personA: { genres: ["pop"], vibeSummary: "Pop favorites" },
    personB: { genres: ["soul"], vibeSummary: "Soul favorites" },
    compatibilityScore: 70, verdict: "A promising overlap",
    recommendations: Array.from({ length: 10 }, (_, index) => `Artist — Recommendation ${index + 1}`),
    superlatives: [{ title: "Pop picker", person: "A" }, { title: "Soul picker", person: "B" }],
  };
  const calls: string[] = [];
  global.fetch = async (url, init) => {
    calls.push(String(url));
    if (String(url) === `https://open.spotify.com/embed/playlist/${id}`) return htmlResponse(embed([track(1)]));
    assert.equal(String(url), "https://api.groq.com/openai/v1/chat/completions");
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(JSON.parse(body.messages[1].content), { personA: ["Artist — Song 1"], personB: ["SZA"] });
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }));
  };
  try {
    const spotify = await normalizeInput("SPOTIFY", `https://open.spotify.com/playlist/${id}`);
    const manual = await normalizeInput("MANUAL", "SZA");
    assert.deepEqual(await analyze(spotify, manual), result);
    assert.equal(calls.length, 2);
  } finally {
    global.fetch = original;
    if (previousKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousKey;
  }
});
