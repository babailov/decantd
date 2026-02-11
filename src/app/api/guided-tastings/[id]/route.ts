import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { guidedTastings } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const updateSchema = z.object({
  wineName: z.string().max(200).optional(),
  varietal: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  wineType: z.enum(['red', 'white', 'rose', 'sparkling']).optional(),
  colorDepth: z.enum(['pale', 'medium', 'deep']).nullable().optional(),
  clarity: z.enum(['clear', 'hazy', 'cloudy']).nullable().optional(),
  viscosityNoted: z.boolean().optional(),
  selectedAromas: z.array(z.string()).optional(),
  acidity: z.number().min(0).max(5).optional(),
  tannin: z.number().min(0).max(5).optional(),
  sweetness: z.number().min(0).max(5).optional(),
  alcohol: z.number().min(0).max(5).optional(),
  body: z.number().min(0).max(5).optional(),
  balance: z.number().int().min(0).max(5).optional(),
  complexity: z.number().int().min(0).max(5).optional(),
  finishLength: z.enum(['short', 'medium', 'long']).nullable().optional(),
  wouldDrinkAgain: z.boolean().nullable().optional(),
  notes: z.string().max(2000).optional(),
  isComplete: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    const tasting = await db.query.guidedTastings.findFirst({
      where: and(
        eq(guidedTastings.id, id),
        eq(guidedTastings.userId, user.id),
      ),
    });

    if (!tasting) {
      return NextResponse.json(
        { message: 'Tasting not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(tasting);
  } catch (err) {
    console.error('Guided tasting fetch error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch tasting' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    // Verify ownership
    const existing = await db.query.guidedTastings.findFirst({
      where: and(
        eq(guidedTastings.id, id),
        eq(guidedTastings.userId, user.id),
      ),
    });

    if (!existing) {
      return NextResponse.json(
        { message: 'Tasting not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const input = updateSchema.parse(body);
    const now = new Date().toISOString();

    // Build update object from provided fields
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (input.wineName !== undefined) updateData.wineName = input.wineName || null;
    if (input.varietal !== undefined) updateData.varietal = input.varietal || null;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.wineType !== undefined) updateData.wineType = input.wineType;
    if (input.colorDepth !== undefined) updateData.colorDepth = input.colorDepth;
    if (input.clarity !== undefined) updateData.clarity = input.clarity;
    if (input.viscosityNoted !== undefined) updateData.viscosityNoted = input.viscosityNoted;
    if (input.selectedAromas !== undefined) updateData.selectedAromas = input.selectedAromas;
    if (input.acidity !== undefined) updateData.acidity = input.acidity;
    if (input.tannin !== undefined) updateData.tannin = input.tannin;
    if (input.sweetness !== undefined) updateData.sweetness = input.sweetness;
    if (input.alcohol !== undefined) updateData.alcohol = input.alcohol;
    if (input.body !== undefined) updateData.body = input.body;
    if (input.balance !== undefined) updateData.balance = input.balance;
    if (input.complexity !== undefined) updateData.complexity = input.complexity;
    if (input.finishLength !== undefined) updateData.finishLength = input.finishLength;
    if (input.wouldDrinkAgain !== undefined) updateData.wouldDrinkAgain = input.wouldDrinkAgain;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.isComplete !== undefined) updateData.isComplete = input.isComplete;

    await db
      .update(guidedTastings)
      .set(updateData as Partial<typeof guidedTastings.$inferInsert>)
      .where(eq(guidedTastings.id, id));

    return NextResponse.json({ id, ...updateData });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error('Guided tasting update error:', err);
    return NextResponse.json(
      { message: 'Failed to update tasting' },
      { status: 500 },
    );
  }
}
