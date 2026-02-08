import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { tastingPlans } from '@/common/db/schema';

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

    const plans = await db.query.tastingPlans.findMany({
      where: eq(tastingPlans.userId, user.id),
      orderBy: [desc(tastingPlans.createdAt)],
    });

    const results = plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      occasion: plan.occasion,
      wineCount: plan.wineCount,
      createdAt: plan.createdAt,
    }));

    return NextResponse.json({ plans: results });
  } catch (err) {
    console.error('Get user plans error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch plans' },
      { status: 500 },
    );
  }
}
