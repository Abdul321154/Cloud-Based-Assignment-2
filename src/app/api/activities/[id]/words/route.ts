import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { singleWordSchema } from "@/lib/validation";
import { fail, ok, toErrorResponse } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/activities/:id/words
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = singleWordSchema.parse(body);

    const activity = await prisma.activityConfig.findUnique({ where: { id } });
    if (!activity) {
      return fail("Activity not found", 404);
    }

    const count = await prisma.word.count({ where: { activityId: id } });

    const word = await prisma.word.create({
      data: {
        activityId: id,
        english: parsed.english || null,
        position: count,
        phonemes: {
          create: parsed.phonemes.map((phoneme, phonemeIndex) => ({
            symbol: phoneme.symbol,
            position: phonemeIndex,
          })),
        },
      },
      include: { phonemes: { orderBy: { position: "asc" } } },
    });

    return ok(word, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
