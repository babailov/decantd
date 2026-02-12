import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: 'Database not available' }, { status: 503 });
    }

    const user = await getUserFromRequest(request, db);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      columns: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      tier: dbUser.subscriptionTier,
      billingStatus: dbUser.subscriptionStatus,
      currentPeriodEnd: dbUser.subscriptionCurrentPeriodEnd,
    });
  } catch (err) {
    console.error('Billing status error:', err);
    return NextResponse.json({ message: 'Failed to fetch billing status' }, { status: 500 });
  }
}
