import { gte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { analyticsEvents } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const LOCAL_ACTION_EVENTS = new Set([
  'corkage_search_used',
  'corkage_filter_used',
  'corkage_card_opened',
  'corkage_call_clicked',
  'corkage_website_clicked',
  'corkage_direction_clicked',
  'corkage_saved',
  'deal_viewed',
  'deal_claim_started',
  'deal_claim_completed',
]);

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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const events = await db.query.analyticsEvents.findMany({
      where: gte(analyticsEvents.createdAt, sevenDaysAgo),
      columns: {
        userId: true,
        eventName: true,
        createdAt: true,
        propertiesJson: true,
      },
    });

    const uniqueUsers = new Set<string>();
    const eventCounts: Record<string, number> = {};
    let localIntentActions = 0;
    const neighborhoods: Record<string, number> = {};

    for (const event of events) {
      if (event.userId) uniqueUsers.add(event.userId);
      eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;

      if (LOCAL_ACTION_EVENTS.has(event.eventName)) {
        localIntentActions += 1;
      }

      const neighborhood = String(event.propertiesJson?.neighborhood || '').trim();
      if (neighborhood) {
        neighborhoods[neighborhood] = (neighborhoods[neighborhood] || 0) + 1;
      }
    }

    const topNeighborhoods = Object.entries(neighborhoods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      windowDays: 7,
      eventsTracked: events.length,
      weeklyActiveUsers: uniqueUsers.size,
      localIntentActions,
      eventCounts,
      topNeighborhoods,
    });
  } catch (err) {
    console.error('Weekly analytics summary error:', err);
    return NextResponse.json({ message: 'Failed to fetch analytics summary' }, { status: 500 });
  }
}
