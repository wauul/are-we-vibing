import { createHash, timingSafeEqual } from "node:crypto";
export const creatorCookie = (id: string) => `vibe_creator_${id}`;
export const hashCreatorSecret = (secret: string) => createHash("sha256").update(secret).digest("hex");
export function hasCreatorProof(hash: string | null, secret?: string) {
  if (!hash || !secret || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashCreatorSecret(secret), "hex"));
}
