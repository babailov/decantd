import { eq, and, gt } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { sessions, users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { setSessionCookie } from '@/server/auth/session';

const tokenSchema = z.object({
  token: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = tokenSchema.parse(body);

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const now = new Date().toISOString();

    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, now),
      ),
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      token,
      expiresAt: session.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        authProvider: (user.oauthProvider as 'google') || null,
        subscriptionTier: (user.subscriptionTier as 'anonymous' | 'free' | 'paid') || 'free',
        billingStatus: (user.subscriptionStatus as
          | 'inactive'
          | 'trialing'
          | 'active'
          | 'past_due'
          | 'canceled'
          | 'unpaid') || 'inactive',
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        createdAt: user.createdAt,
      },
    });

    response.headers.set('Set-Cookie', setSessionCookie(token, session.expiresAt));
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid token format' },
        { status: 400 },
      );
    }
    console.error('Token exchange error:', err);
    return NextResponse.json(
      { message: 'Failed to exchange token' },
      { status: 500 },
    );
  }
}
