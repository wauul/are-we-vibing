import { test } from "node:test";
import assert from "node:assert/strict";
import { listYouTubePlaylists, youtubeReturnPath } from "../src/lib/youtube-account";
import { normalizeInput } from "../src/lib/normalize";

test("YouTube connection preserves direct invite recipients and rejects external return destinations", () => {
  assert.equal(youtubeReturnPath("/session/new?friend=sam_records"), "/session/new?friend=sam_records");
  assert.equal(youtubeReturnPath("/session/new?friend=sam_records&next=https://evil.example"), "/session/new?friend=sam_records");
  assert.equal(youtubeReturnPath("/session/12345678?friend=sam_records"), "/session/12345678");
  for (const value of ["https://evil.example/session/new", "//evil.example/session/new", "/session/../friends", "/session/\\evil.example"]) assert.throws(() => youtubeReturnPath(value));
});

test("account playlists use read-only bearer access, pagination and uncached requests without returning credentials", async () => {
  const original = global.fetch;
  global.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://www.googleapis.com");
    assert.equal(url.pathname, "/youtube/v3/playlists");
    assert.equal(url.searchParams.get("mine"), "true");
    assert.equal(url.searchParams.get("pageToken"), "next-page");
    assert.equal(url.searchParams.get("maxResults"), "50");
    assert.equal(url.searchParams.has("key"), false);
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer private-token");
    assert.equal(init?.cache, "no-store");
    return Response.json({ nextPageToken: "another-page", items: [{ id: "PL1234567890", snippet: { title: "My private mix" }, status: { privacyStatus: "private" }, contentDetails: { itemCount: 36 } }] });
  };
  try {
    assert.deepEqual(await listYouTubePlaylists("private-token", "next-page"), {
      playlists: [{ id: "PL1234567890", title: "My private mix", count: 36, privacy: "private" }], nextPageToken: "another-page",
    });
  } finally { global.fetch = original; }
});

test("expired YouTube access asks for reconnect while provider failures offer the link alternative", async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => new Response(null, { status: 401 });
    await assert.rejects(listYouTubePlaylists("expired"), { status: 401 });
    global.fetch = async () => new Response(null, { status: 403 });
    await assert.rejects(listYouTubePlaylists("valid"), { status: 422 });
  } finally { global.fetch = original; }
});

test("selected private playlists import through OAuth without requiring a public API key", async () => {
  const original = global.fetch;
  const key = process.env.YOUTUBE_API_KEY;
  delete process.env.YOUTUBE_API_KEY;
  global.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, "/youtube/v3/playlistItems");
    assert.equal(url.searchParams.get("playlistId"), "PL1234567890");
    assert.equal(url.searchParams.get("maxResults"), "20");
    assert.equal(url.searchParams.has("key"), false);
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer account-token");
    return Response.json({ items: [{ snippet: { title: "SZA — Good Days" } }, { snippet: { title: "Private video" } }] });
  };
  try { assert.deepEqual(await normalizeInput("YOUTUBE", "https://www.youtube.com/playlist?list=PL1234567890", "account-token"), ["SZA — Good Days"]); }
  finally { global.fetch = original; if (key !== undefined) process.env.YOUTUBE_API_KEY = key; }
});
