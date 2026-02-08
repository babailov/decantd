import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { wineRatings } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const ratingSchema = z.object({
  planWineId: z.string().uuid(),
  planId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  tastingNotes: z.string().max(1000).optional(),
  tried: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const user = await getUserFromRequest(request, db);
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const input = ratingSchema.parse(body);
    const now = new Date().toISOString();

    // Check if rating already exists for this user + wine
    const existing = await db.query.wineRatings.findFirst({
      where: and(
        eq(wineRatings.userId, user.id),
        eq(wineRatings.planWineId, input.planWineId),
      ),
    });

    if (existing) {
      // Update existing rating
      await db
        .update(wineRatings)
        .set({
          rating: input.rating,
          tastingNotes: input.tastingNotes || null,
          tried: input.tried,
        } as Partial<typeof wineRatings.$inferInsert>)
        .where(eq(wineRatings.id, existing.id));

      return NextResponse.json({
        id: existing.id,
        ...input,
        userId: user.id,
        updatedAt: now,
      });
    }

    // Create new rating
    const id = crypto.randomUUID();
    await db.insert(wineRatings).values({
      id,
      userId: user.id,
      planWineId: input.planWineId,
      planId: input.planId,
      rating: input.rating,
      tastingNotes: input.tastingNotes || null,
      tried: input.tried,
    } as typeof wineRatings.$inferInsert);

    return NextResponse.json({
      id,
      ...input,
      userId: user.id,
      createdAt: now,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error('Rating error:', err);
    return NextResponse.json(
      { message: 'Failed to save rating' },
      { status: 500 },
    );
  }
}
