import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { trophyArt } from "../src/lib/trophy-art";

test("award subject wins over incidental playlist and DJ words", () => {
  assert.equal(trophyArt("Keeper of the after-hours playlist").kind, "night");
  assert.equal(trophyArt("DJ sunshine").kind, "sun");
  assert.equal(trophyArt("First to claim the aux cord").kind, "aux");
});

test("title-driven artwork stays available for older and unfamiliar awards", () => {
  for (const title of ["Night owl", "Singer", "Genre explorer", "Heartbreak hotel", "Riff collector", "Dance floor regular", "A one-of-a-kind music award"]) {
    const art = trophyArt(title);
    assert.ok(existsSync(`public${art.src}`), `${title} references a shipped asset`);
    assert.ok(art.description.length > 10);
  }
});
