import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { verifyPassword } from '@/server/auth/password';
import { createSession, setSessionCookie } from '@/server/auth/session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      );
    }

    const { token, expiresAt } = await createSession(db, user.id);

    const response = NextResponse.json({
      token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
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

    response.headers.set('Set-Cookie', setSessionCookie(token, expiresAt));
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input' },
        { status: 400 },
      );
    }
    console.error('Login error:', err);
    return NextResponse.json(
      { message: 'Failed to log in' },
      { status: 500 },
    );
  }
}
