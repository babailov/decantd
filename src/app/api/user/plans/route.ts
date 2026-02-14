import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { tastingPlans } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

type PlanMode = 'food_to_wine' | 'wine_to_food';
type PairingLabel = 'Food pairing' | 'Wine pairing';

interface GeneratedPlanSnapshot {
  mode?: PlanMode;
  pairings?: unknown[];
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

    const plans = await db.query.tastingPlans.findMany({
      where: eq(tastingPlans.userId, user.id),
      orderBy: [desc(tastingPlans.createdAt)],
    });

    const results = plans.map((plan) => {
      const generatedPlan = (plan.generatedPlan ?? {}) as GeneratedPlanSnapshot;
      const mode: PlanMode = generatedPlan.mode === 'wine_to_food' ? 'wine_to_food' : 'food_to_wine';
      const pairingLabel: PairingLabel = mode === 'wine_to_food' ? 'Food pairing' : 'Wine pairing';
      const pairingValue = mode === 'wine_to_food'
        ? (
            Array.isArray(generatedPlan.pairings) && generatedPlan.pairings.length > 0
              ? `${generatedPlan.pairings.length} ${generatedPlan.pairings.length === 1 ? 'dish pairing' : 'dish pairings'}`
              : 'No pairings yet'
          )
        : `${plan.wineCount} ${plan.wineCount === 1 ? 'wine' : 'wines'}`;

      return {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        occasion: plan.occasion,
        mode,
        pairingLabel,
        pairingValue,
        createdAt: plan.createdAt,
      };
    });

    return NextResponse.json({ plans: results });
  } catch (err) {
    console.error('Get user plans error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch plans' },
      { status: 500 },
    );
  }
}
