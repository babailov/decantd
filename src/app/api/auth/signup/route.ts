import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { hashPassword } from '@/server/auth/password';
import { createSession, setSessionCookie } from '@/server/auth/session';

const signUpSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = signUpSchema.parse(body);

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (existing) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(input.password);
    const now = new Date().toISOString();

    await db.insert(users).values({
      id: userId,
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
    } as typeof users.$inferInsert);

    const { token, expiresAt } = await createSession(db, userId);

    const response = NextResponse.json({
      token,
      expiresAt,
      user: {
        id: userId,
        email: input.email.toLowerCase(),
        displayName: input.displayName,
        avatarUrl: null,
        subscriptionTier: 'free',
        billingStatus: 'inactive',
        subscriptionCurrentPeriodEnd: null,
        createdAt: now,
      },
    });

    response.headers.set('Set-Cookie', setSessionCookie(token, expiresAt));
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error('Signup error:', err);
    return NextResponse.json(
      { message: 'Failed to create account' },
      { status: 500 },
    );
  }
}
