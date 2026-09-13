import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submission } from "@/lib/schema";
import { normalizeInput } from "@/lib/normalize";
import { apiError, readBody, requireEnv } from "@/lib/errors";
import { sessionView } from "@/lib/sessions";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const input = submission.parse(await readBody(request));
    requireEnv("DATABASE_URL");
    requireEnv("GROQ_API_KEY");
    const list = await normalizeInput(input.type, input.value);
    const s = await db.session.create({
      data: {
        personAName: input.name,
        personAInputType: input.type,
        personANormalizedList: list,
      },
    });
    return NextResponse.json(sessionView(s), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
