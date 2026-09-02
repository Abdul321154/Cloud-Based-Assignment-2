import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { singleWordSchema } from "@/lib/validation";
import { fail, ok, toErrorResponse } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/words/:id
// Updates a single word's english gloss and/or phonemes.
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = singleWordSchema.parse(body);

    const existing = await prisma.word.findUnique({ where: { id } });
    if (!existing) {
      return fail("Word not found", 404);
    }

    // Replace the phonemes for this word.
    await prisma.phoneme.deleteMany({ where: { wordId: id } });

    const updated = await prisma.word.update({
      where: { id },
      data: {
        english: parsed.english || null,
        phonemes: {
          create: parsed.phonemes.map((phoneme, phonemeIndex) => ({
            symbol: phoneme.symbol,
            position: phonemeIndex,
          })),
        },
      },
      include: { phonemes: { orderBy: { position: "asc" } } },
    });

    return ok(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// DELETE /api/words/:id
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.word.findUnique({ where: { id } });
    if (!existing) {
      return fail("Word not found", 404);
    }

    await prisma.word.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
