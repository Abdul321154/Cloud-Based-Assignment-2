import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validation";
import { fail, ok, toErrorResponse } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/activities/:id
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const activity = await prisma.activityConfig.findUnique({
      where: { id },
      include: {
        words: {
          orderBy: { position: "asc" },
          include: { phonemes: { orderBy: { position: "asc" } } },
        },
      },
    });

    if (!activity) {
      return fail("Activity not found", 404);
    }

    return ok(activity);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// PUT /api/activities/:id
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = activitySchema.parse(body);

    const existing = await prisma.activityConfig.findUnique({ where: { id } });
    if (!existing) {
      return fail("Activity not found", 404);
    }

    const updated = await prisma.$transaction([
      prisma.word.deleteMany({ where: { activityId: id } }),
      prisma.activityConfig.update({
        where: { id },
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
      }),
    ]);

    return ok(updated[1]);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// DELETE /api/activities/:id
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.activityConfig.findUnique({ where: { id } });
    if (!existing) {
      return fail("Activity not found", 404);
    }

    await prisma.activityConfig.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
