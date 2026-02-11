import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { analyticsEvents } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const payloadSchema = z.object({
  eventName: z.string().min(1).max(120),
  sessionId: z.string().min(1).max(120),
  path: z.string().max(300).nullable().optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: 'Database not available' }, { status: 503 });
    }

    const body = await request.json();
    const input = payloadSchema.parse(body);
    const user = await getUserFromRequest(request, db).catch(() => null);

    await db.insert(analyticsEvents).values({
      id: crypto.randomUUID(),
      userId: user?.id ?? null,
      sessionId: input.sessionId,
      eventName: input.eventName,
      propertiesJson: input.properties,
      path: input.path ?? null,
      createdAt: new Date().toISOString(),
    } as typeof analyticsEvents.$inferInsert);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid analytics payload' }, { status: 400 });
    }
    console.error('Analytics event error:', err);
    return NextResponse.json({ message: 'Failed to track event' }, { status: 500 });
  }
}
