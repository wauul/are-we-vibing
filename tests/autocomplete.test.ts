import test from "node:test";
import assert from "node:assert/strict";
import { activePick, completePick } from "../src/lib/autocomplete";
import { GET } from "../src/app/api/music/search/route";

test("autocomplete replaces the active pick and preserves surrounding entries", () => {
  const value = "SZA, Daf\nFrank Ocean";
  assert.equal(activePick(value, 8).query, "Daf");
  assert.equal(completePick(value, 8, "Daft Punk").value, "SZA,Daft Punk\nFrank Ocean");
  assert.deepEqual(completePick("SZA\nDaf", 7, "Daft Punk"), { value: "SZA\nDaft Punk\n", caret: 14 });
  assert.equal(completePick("Ty", 2, "Tyler, The Creator").value, "Tyler The Creator\n");
});

test("music search deduplicates artists and songs and skips short queries", async () => {
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; return Response.json({ results: [
    { artistName: "Daft Punk", trackName: "One More Time" },
    { artistName: "Daft Punk", trackName: "One More Time" },
  ] }); };
  try {
    await GET(new Request("https://example.com/api/music/search?q=d"));
    assert.equal(calls, 0);
    const response = await GET(new Request("https://example.com/api/music/search?q=daft"));
    assert.deepEqual((await response.json()).suggestions, [
      { label: "Daft Punk", kind: "artist" }, { label: "Daft Punk — One More Time", kind: "song" },
    ]);
  } finally { global.fetch = original; }
});

test("catalog outages degrade to optional suggestions without blocking manual entry", async () => {
  const original = global.fetch;
  global.fetch = async () => new Response("", { status: 429 });
  try {
    const response = await GET(new Request("https://example.com/api/music/search?q=sza"));
    assert.deepEqual(await response.json(), { suggestions: [], unavailable: true });
  } finally { global.fetch = original; }
});
