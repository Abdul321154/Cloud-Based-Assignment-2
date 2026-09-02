import { prisma } from "@/lib/prisma";

// GET /health
export async function GET() {
  try {
    // Confirm the database is reachable with a trivial query.
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      {
        status: "ok",
        service: "phoneme-activity-builder",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[health] database check failed:", error);
    return Response.json(
      {
        status: "degraded",
        service: "phoneme-activity-builder",
        database: "unavailable",
        error: (error as Error).message,
      },
      { status: 503 },
    );
  }
}
