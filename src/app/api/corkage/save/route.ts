import { and, desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { savedVenues } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const schema = z.object({
  restaurantId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ message: 'Database not available' }, { status: 503 });

    const user = await getUserFromRequest(request, db);
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const rows = await db.query.savedVenues.findMany({
      where: eq(savedVenues.userId, user.id),
      orderBy: [desc(savedVenues.createdAt)],
      columns: { restaurantId: true },
    });

    return NextResponse.json({ restaurantIds: rows.map((r) => r.restaurantId) });
  } catch (err) {
    console.error('Saved venues list error:', err);
    return NextResponse.json({ message: 'Failed to fetch saved venues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ message: 'Database not available' }, { status: 503 });

    const user = await getUserFromRequest(request, db);
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { restaurantId } = schema.parse(body);

    const existing = await db.query.savedVenues.findFirst({
      where: and(eq(savedVenues.userId, user.id), eq(savedVenues.restaurantId, restaurantId)),
    });

    if (existing) {
      await db.delete(savedVenues).where(eq(savedVenues.id, existing.id));
      return NextResponse.json({ saved: false });
    }

    await db.insert(savedVenues).values({
      id: crypto.randomUUID(),
      userId: user.id,
      restaurantId,
      createdAt: new Date().toISOString(),
    } as typeof savedVenues.$inferInsert);

    return NextResponse.json({ saved: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }
    console.error('Saved venue toggle error:', err);
    return NextResponse.json({ message: 'Failed to save venue' }, { status: 500 });
  }
}
