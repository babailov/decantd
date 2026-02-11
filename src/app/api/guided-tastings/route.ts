import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { guidedTastings } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const createSchema = z.object({
  wineName: z.string().max(200).optional(),
  varietal: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  wineType: z.enum(['red', 'white', 'rose', 'sparkling']),
  colorDepth: z.enum(['pale', 'medium', 'deep']).nullable().optional(),
  clarity: z.enum(['clear', 'hazy', 'cloudy']).nullable().optional(),
  viscosityNoted: z.boolean().default(false),
  selectedAromas: z.array(z.string()).default([]),
  acidity: z.number().min(0).max(5).default(3),
  tannin: z.number().min(0).max(5).default(3),
  sweetness: z.number().min(0).max(5).default(1),
  alcohol: z.number().min(0).max(5).default(3),
  body: z.number().min(0).max(5).default(3),
  balance: z.number().int().min(0).max(5).default(0),
  complexity: z.number().int().min(0).max(5).default(0),
  finishLength: z.enum(['short', 'medium', 'long']).nullable().optional(),
  wouldDrinkAgain: z.boolean().nullable().optional(),
  notes: z.string().max(2000).default(''),
  isComplete: z.boolean().default(false),
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
    const input = createSchema.parse(body);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(guidedTastings).values({
      id,
      userId: user.id,
      wineName: input.wineName || null,
      varietal: input.varietal || null,
      year: input.year || null,
      wineType: input.wineType,
      colorDepth: input.colorDepth || null,
      clarity: input.clarity || null,
      viscosityNoted: input.viscosityNoted,
      selectedAromas: input.selectedAromas,
      acidity: input.acidity,
      tannin: input.tannin,
      sweetness: input.sweetness,
      alcohol: input.alcohol,
      body: input.body,
      balance: input.balance,
      complexity: input.complexity,
      finishLength: input.finishLength || null,
      wouldDrinkAgain: input.wouldDrinkAgain ?? null,
      notes: input.notes,
      isComplete: input.isComplete,
      createdAt: now,
      updatedAt: now,
    } as typeof guidedTastings.$inferInsert);

    return NextResponse.json({ id, ...input, userId: user.id, createdAt: now, updatedAt: now });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error('Guided tasting create error:', err);
    return NextResponse.json(
      { message: 'Failed to save tasting' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
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

    const tastings = await db.query.guidedTastings.findMany({
      where: eq(guidedTastings.userId, user.id),
      orderBy: [desc(guidedTastings.createdAt)],
    });

    return NextResponse.json({ tastings });
  } catch (err) {
    console.error('Guided tastings list error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch tastings' },
      { status: 500 },
    );
  }
}
