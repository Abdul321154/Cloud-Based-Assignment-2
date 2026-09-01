import { ZodError } from "zod";

// JSON response helpers for the API route handlers.

export function ok<T>(data: T, status = 200) {
  return Response.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  const body: { ok: false; error: string; details?: unknown } = {
    ok: false,
    error: message,
  };
  if (details !== undefined) body.details = details;
  return Response.json(body, { status });
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return fail(
      "Validation failed",
      400,
      error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    );
  }

  const code = (error as { code?: string })?.code;

  // Prisma record-not-found
  if (code === "P2025") {
    return fail("Record not found", 404);
  }

  // Prisma unique-constraint violation
  if (code === "P2002") {
    return fail("A record with that value already exists", 409);
  }

  console.error("[api]Unhandled error:", error);
  return fail("Internal server error", 500);
}
