import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { hashPassword, verifyPassword } from '@/server/auth/password';
import { getUserFromRequest } from '@/server/auth/session';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const input = changePasswordSchema.parse(body);

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 },
      );
    }

    if (dbUser.passwordHash === 'OAUTH_NO_PASSWORD') {
      return NextResponse.json(
        { message: 'This account uses Google sign-in and has no password to change.' },
        { status: 400 },
      );
    }

    const valid = await verifyPassword(input.currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(input.newPassword);

    await db
      .update(users)
      .set({
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
      } as Partial<typeof users.$inferInsert>)
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Password must be 8-128 characters' },
        { status: 400 },
      );
    }
    console.error('Change password error:', err);
    return NextResponse.json(
      { message: 'Failed to change password' },
      { status: 500 },
    );
  }
}
