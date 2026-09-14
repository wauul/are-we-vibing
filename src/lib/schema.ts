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
    recommendations: z.array(z.string().trim().min(1).max(200)).length(3),
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
export type SessionView = {
  id: string;
  personAName: string;
  personAInputType: InputType;
  personBName: string | null;
  personBInputType: InputType | null;
  resultJson: VibeResult | null;
  status: "waiting" | "matching" | "ready" | "retry";
  generationAttempts: number;
  isOwner?: boolean;
  isDirect?: boolean;
};
