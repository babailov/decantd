import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { wineRatings } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> },
) {
  try {
    const { planId } = await params;

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const user = await getUserFromRequest(request, db);
    if (!user) {
      return NextResponse.json({ ratings: [] });
    }

    const ratings = await db.query.wineRatings.findMany({
      where: eq(wineRatings.planId, planId),
    });

    // Filter to only this user's ratings
    const userRatings = ratings
      .filter((r) => r.userId === user.id)
      .map((r) => ({
        id: r.id,
        planWineId: r.planWineId,
        planId: r.planId,
        rating: r.rating,
        tastingNotes: r.tastingNotes,
        tried: r.tried,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

    return NextResponse.json({ ratings: userRatings });
  } catch (err) {
    console.error('Get ratings error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch ratings' },
      { status: 500 },
    );
  }
}
