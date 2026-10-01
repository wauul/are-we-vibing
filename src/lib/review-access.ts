import { createHash, timingSafeEqual } from "node:crypto";

// Only the dedicated review profile can be selected; never accept an account ID.
export function validReviewPassword(input: unknown, expected = process.env.PLAY_REVIEW_PASSWORD) {
  if (!expected || expected.length < 24 || typeof input !== "string" || input.length > 256) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(input), digest(expected));
}
