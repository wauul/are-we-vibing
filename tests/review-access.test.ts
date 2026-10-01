import test from "node:test";
import assert from "node:assert/strict";
import { validReviewPassword } from "../src/lib/review-access";

test("review access is disabled without a strong configured password", () => {
  assert.equal(validReviewPassword("anything", ""), false);
  assert.equal(validReviewPassword("short", "short"), false);
});
test("review access only accepts the exact configured secret", () => {
  const secret = "a".repeat(32);
  assert.equal(validReviewPassword(secret, secret), true);
  for (const input of [undefined, null, {}, "b".repeat(32), "a".repeat(31), "a".repeat(257)]) {
    assert.equal(validReviewPassword(input, secret), false);
  }
});
