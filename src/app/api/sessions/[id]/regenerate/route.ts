import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, readBody } from "@/lib/errors";
import { generate } from "@/lib/sessions";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await readBody(request);
    return NextResponse.json(
      await generate(
        z
          .string()
          .uuid()
          .parse((await params).id),
      ),
    );
  } catch (error) {
    return apiError(error);
  }
}
