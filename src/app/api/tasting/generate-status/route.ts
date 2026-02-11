import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';
import { getDailyGenerationCount, resolveUserTier, getTierConfig } from '@/server/tier/resolve-tier';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    let user = null;
    try {
      user = await getUserFromRequest(request, db);
    } catch {
      // Not authenticated
    }

    const tier = resolveUserTier(user);
    const config = getTierConfig(tier);

    if (!user || config.dailyGenerationLimit === null) {
      return NextResponse.json({
        tier,
        dailyLimit: config.dailyGenerationLimit,
        used: 0,
        remaining: config.dailyGenerationLimit,
      });
    }

    const used = await getDailyGenerationCount(db, user.id);
    const remaining = Math.max(0, config.dailyGenerationLimit - used);

    return NextResponse.json({
      tier,
      dailyLimit: config.dailyGenerationLimit,
      used,
      remaining,
    });
  } catch (err) {
    console.error('Generation status error:', err);
    return NextResponse.json(
      { message: 'Failed to get generation status' },
      { status: 500 },
    );
  }
}
