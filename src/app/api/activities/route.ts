import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validation";
import { ok, toErrorResponse } from "@/lib/api";

// GET /api/activities?activityType=wordle
export async function GET(request: NextRequest) {
  try {
    const typeParam = request.nextUrl.searchParams.get("activityType");

    const activities = await prisma.activityConfig.findMany({
      where: typeParam ? { activityType: typeParam } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        words: {
          orderBy: { position: "asc" },
          include: { phonemes: { orderBy: { position: "asc" } } },
        },
      },
    });

    return ok(activities);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// POST /api/activities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = activitySchema.parse(body);

    const created = await prisma.activityConfig.create({
      data: {
        name: parsed.name,
        activityType: parsed.activityType,
        difficulty: parsed.difficulty,
        showHints: parsed.showHints,
        numGuesses: parsed.numGuesses,
        rows: parsed.rows,
        cols: parsed.cols,
        words: {
          create: parsed.words.map((word, wordIndex) => ({
            english: word.english || null,
            position: wordIndex,
            phonemes: {
              create: word.phonemes.map((phoneme, phonemeIndex) => ({
                symbol: phoneme.symbol,
                position: phonemeIndex,
              })),
            },
          })),
        },
      },
      include: {
        words: {
          orderBy: { position: "asc" },
          include: { phonemes: { orderBy: { position: "asc" } } },
        },
      },
    });

    return ok(created, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
