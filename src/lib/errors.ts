import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function apiError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message || "Check your input." },
      { status: 400 },
    );
  if (error instanceof AppError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "That request was off-beat. Please try again." },
      { status: 400 },
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "UnknownError",
    error instanceof Prisma.PrismaClientKnownRequestError ? error.code : "",
  );
  return NextResponse.json(
    { error: "Our turntables hit a snag. Please try again in a moment." },
    { status: 503 },
  );
}
export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value)
    throw new AppError(
      "This music connection is not set up yet. Try another input method or check back soon.",
      503,
    );
  return value;
}
export async function readBody(request: Request) {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    throw new AppError("Please submit from this app.", 403);
  const text = await request.text();
  if (text.length > 12000) throw new AppError("That mixtape is too long.", 413);
  return JSON.parse(text);
}
