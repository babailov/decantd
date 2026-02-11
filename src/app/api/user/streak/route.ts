import { and, eq, gte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { analyticsEvents } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const QUALIFYING_EVENTS = new Set([
  'plan_generated',
  'guided_tasting_completed',
  'journal_entry_created',
  'corkage_saved',
  'deal_claim_completed',
]);

function dateKey(iso: string) {
  return iso.slice(0, 10);
}

function computeCurrentStreak(activityDays: string[]) {
  const set = new Set(activityDays);
  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ message: 'Database not available' }, { status: 503 });

    const user = await getUserFromRequest(request, db);
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const events = await db.query.analyticsEvents.findMany({
      where: and(eq(analyticsEvents.userId, user.id), gte(analyticsEvents.createdAt, since)),
      columns: {
        eventName: true,
        createdAt: true,
      },
      orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    });

    const activityDays = Array.from(
      new Set(
        events
          .filter((e) => QUALIFYING_EVENTS.has(e.eventName))
          .map((e) => dateKey(e.createdAt)),
      ),
    ).sort();

    const streak = computeCurrentStreak(activityDays);
    const actionsThisWeek = events.filter(
      (e) => QUALIFYING_EVENTS.has(e.eventName),
    ).length;

    return NextResponse.json({
      currentStreak: streak,
      activeDays: activityDays.length,
      actionsThisWeek,
      activityDays,
    });
  } catch (err) {
    console.error('User streak error:', err);
    return NextResponse.json({ message: 'Failed to fetch streak' }, { status: 500 });
  }
}
