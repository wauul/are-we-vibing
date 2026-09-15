import { z } from "zod";
export const inputType = z.enum(["SPOTIFY", "YOUTUBE", "MANUAL"]);
export type InputType = z.infer<typeof inputType>;
export const submission = z.object({
  name: z.string().trim().min(1, "Give your DJ a name.").max(40),
  type: inputType,
  value: z.string().trim().min(1, "Add a little music first.").max(5000),
});
const person = z
  .object({
    genres: z.array(z.string().trim().min(1).max(50)).min(1).max(6),
    vibeSummary: z.string().trim().min(1).max(400),
  })
  .strict();
export const resultSchema = z
  .object({
    personA: person,
    personB: person,
    compatibilityScore: z.number().int().min(0).max(100),
    verdict: z.string().trim().min(1).max(400),
    recommendations: z.array(z.string().trim().min(1).max(200)).length(10),
    superlatives: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(160),
            person: z.enum(["A", "B"]),
          })
          .strict(),
      )
      .length(2),
  })
  .strict();
export type VibeResult = z.infer<typeof resultSchema>;
// Existing shared links keep their original three recommendations. New AI output is strict ten.
export const storedResultSchema = resultSchema.extend({
  recommendations: z.array(z.string().trim().min(1).max(200)).refine(v => v.length === 3 || v.length === 10),
});
export const playlistTrackSchema = z.object({
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  title: z.string().max(300),
  thumbnailUrl: z.string().url(),
});
export type PlaylistTrack = z.infer<typeof playlistTrackSchema>;
export type SessionView = {
  id: string;
  personAName: string;
  personAInputType: InputType;
  personBName: string | null;
  personBInputType: InputType | null;
  resultJson: VibeResult | null;
  playlist?: PlaylistTrack[];
  status: "waiting" | "matching" | "ready" | "retry";
  generationAttempts: number;
  isOwner?: boolean;
  isDirect?: boolean;
};
