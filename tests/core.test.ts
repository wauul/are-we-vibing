import test from "node:test";
import assert from "node:assert/strict";
import { normalizeInput, playlistId } from "../src/lib/normalize";
import { analyze } from "../src/lib/ai";
import { resultSchema } from "../src/lib/schema";
const result = {
  personA: { genres: ["soul"], vibeSummary: "Warm" },
  personB: { genres: ["soul"], vibeSummary: "Chill" },
  compatibilityScore: 85,
  verdict: "Aux allies",
  recommendations: ["A — B", "C — D", "E — F"],
  superlatives: [
    { title: "DJ sunshine", person: "A" },
    { title: "Night owl", person: "B" },
  ],
};
test("manual normalization trims, drops blanks and caps at 15", async () => {
  assert.deepEqual(
    await normalizeInput("MANUAL", " SZA,\n Frank Ocean ,, Dreams "),
    ["SZA", "Frank Ocean", "Dreams"],
  );
  assert.equal(
    (
      await normalizeInput(
        "MANUAL",
        Array.from({ length: 20 }, (_, i) => `Song ${i}`).join(","),
      )
    ).length,
    15,
  );
  await assert.rejects(() => normalizeInput("MANUAL", " , \n"));
});
test("playlist parsing rejects spoofed hosts and invalid sources", () => {
  assert.equal(
    playlistId(
      "SPOTIFY",
      "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=test",
    ),
    "37i9dQZF1DXcBWIGoYBM5M",
  );
  assert.equal(
    playlistId(
      "YOUTUBE",
      "https://music.youtube.com/playlist?list=PL1234567890",
    ),
    "PL1234567890",
  );
  assert.throws(() =>
    playlistId("YOUTUBE", "https://youtube.com.evil.test/?list=PL1234567890"),
  );
  assert.throws(() =>
    playlistId("SPOTIFY", "http://127.0.0.1/playlist/37i9dQZF1DXcBWIGoYBM5M"),
  );
});
test("AI schema rejects invalid bounds and missing recommendations", () => {
  assert.ok(resultSchema.safeParse(result).success);
  assert.equal(
    resultSchema.safeParse({ ...result, compatibilityScore: 101 }).success,
    false,
  );
  assert.equal(
    resultSchema.safeParse({ ...result, recommendations: [] }).success,
    false,
  );
});
test("Groq retries malformed output exactly once and validates the retry", async () => {
  const original = global.fetch;
  process.env.GROQ_API_KEY = "test-only";
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return new Response(
      JSON.stringify({
        choices: [
          { message: { content: calls === 1 ? "{}" : JSON.stringify(result) } },
        ],
      }),
      { status: 200 },
    );
  };
  try {
    assert.equal((await analyze(["SZA"], ["SZA"])).compatibilityScore, 85);
    assert.equal(calls, 2);
  } finally {
    global.fetch = original;
    delete process.env.GROQ_API_KEY;
  }
});
test("second malformed Groq response yields friendly regeneration error", async () => {
  const original = global.fetch;
  process.env.GROQ_API_KEY = "test-only";
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return new Response(
      JSON.stringify({ choices: [{ message: { content: "not json" } }] }),
    );
  };
  try {
    await assert.rejects(() => analyze(["SZA"], ["SZA"]), /regenerate/);
    assert.equal(calls, 2);
  } finally {
    global.fetch = original;
    delete process.env.GROQ_API_KEY;
  }
});
test("YouTube keeps raw titles, excludes private videos, and caps request at 20", async () => {
  const original = global.fetch;
  process.env.YOUTUBE_API_KEY = "test-only";
  global.fetch = async (url) => {
    assert.equal(new URL(String(url)).searchParams.get("maxResults"), "20");
    return new Response(
      JSON.stringify({
        items: [
          { snippet: { title: "Artist - Track (Official Video)" } },
          { snippet: { title: "Private video" } },
        ],
      }),
    );
  };
  try {
    assert.deepEqual(
      await normalizeInput(
        "YOUTUBE",
        "https://www.youtube.com/playlist?list=PL1234567890",
      ),
      ["Artist - Track (Official Video)"],
    );
  } finally {
    global.fetch = original;
    delete process.env.YOUTUBE_API_KEY;
  }
});
