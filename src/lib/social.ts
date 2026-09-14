import { z } from "zod";
import { AppError } from "./errors";

export const profileInput = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/, "Use 3–24 letters, numbers, or underscores for your username."),
  name: z.string().trim().min(1).max(40),
});
export function friendPair(a: string, b: string) { return [a, b].sort().join(":"); }
export function assertSessionAccess(session: { ownerId: string | null; invitedUserId: string | null }, userId?: string) {
  if (session.invitedUserId && userId !== session.ownerId && userId !== session.invitedUserId)
    throw new AppError("This is a direct invite. Sign in with the invited Google account to open it.", 403);
}
