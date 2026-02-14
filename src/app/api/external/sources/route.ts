import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { sourceRegistry } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const sourceSchema = z.object({
  name: z.string().min(1).max(200),
  sourceType: z.enum(['license', 'partner', 'public']),
  licenseType: z.enum(['paid', 'permissioned', 'public_domain', 'owned']),
  trustTier: z.enum(['A', 'B', 'C']).default('C'),
  updateCadence: z.string().max(60).optional(),
  accessNotes: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

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

    const sources = await db.query.sourceRegistry.findMany({
      orderBy: [desc(sourceRegistry.createdAt)],
    });

    return NextResponse.json({ sources });
  } catch (err) {
    console.error('Sources GET error:', err);
    return NextResponse.json({ message: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: 'Database not available' }, { status: 503 });
    }

    const user = await getUserFromRequest(request, db);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const input = sourceSchema.parse(body);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(sourceRegistry).values({
      id,
      ...input,
      createdAt: now,
      updatedAt: now,
    } as typeof sourceRegistry.$inferInsert);

    return NextResponse.json({ id, ...input, createdAt: now, updatedAt: now }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error('Sources POST error:', err);
    return NextResponse.json({ message: 'Failed to create source' }, { status: 500 });
  }
}
