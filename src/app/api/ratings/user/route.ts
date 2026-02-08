import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { tastingPlans, tastingPlanWines, wineRatings } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

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

    const ratings = await db.query.wineRatings.findMany({
      where: eq(wineRatings.userId, user.id),
      orderBy: [desc(wineRatings.createdAt)],
    });

    // Fetch associated wine details
    const wineIds = ratings.map((r) => r.planWineId);
    const wines = wineIds.length > 0
      ? await Promise.all(
          wineIds.map((id) =>
            db.query.tastingPlanWines.findFirst({
              where: eq(tastingPlanWines.id, id),
            }),
          ),
        )
      : [];

    const wineMap = new Map(
      wines.filter(Boolean).map((w) => [w!.id, w!]),
    );

    // Fetch associated plan details for titles
    const planIds = [...new Set(ratings.map((r) => r.planId))];
    const plans = planIds.length > 0
      ? await Promise.all(
          planIds.map((id) =>
            db.query.tastingPlans.findFirst({
              where: eq(tastingPlans.id, id),
            }),
          ),
        )
      : [];

    const planMap = new Map(
      plans.filter(Boolean).map((p) => [p!.id, p!]),
    );

    const results = ratings.map((r) => {
      const wine = wineMap.get(r.planWineId);
      const plan = planMap.get(r.planId);
      return {
        id: r.id,
        rating: r.rating,
        tastingNotes: r.tastingNotes,
        tried: r.tried,
        createdAt: r.createdAt,
        planId: r.planId,
        wine: wine
          ? {
              id: wine.id,
              varietal: wine.varietal,
              region: wine.region,
              wineType: wine.wineType,
              description: wine.description,
              acidity: wine.acidity,
              tannin: wine.tannin,
              sweetness: wine.sweetness,
              alcohol: wine.alcohol,
              body: wine.body,
            }
          : null,
        plan: plan
          ? {
              id: plan.id,
              title: plan.title,
            }
          : null,
      };
    });

    return NextResponse.json({ ratings: results });
  } catch (err) {
    console.error('Get user ratings error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch ratings' },
      { status: 500 },
    );
  }
}
