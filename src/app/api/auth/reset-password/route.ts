import { and, eq, gt, isNull } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { passwordResetTokens, users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { hashPassword } from '@/server/auth/password';
import { hashToken } from '@/server/auth/token';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const tokenHash = await hashToken(input.token);
    const now = new Date().toISOString();

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(input.newPassword);

    await db
      .update(users)
      .set({
        passwordHash: newHash,
        updatedAt: now,
      } as Partial<typeof users.$inferInsert>)
      .where(eq(users.id, resetToken.userId));

    await db
      .update(passwordResetTokens)
      .set({ usedAt: now } as Partial<typeof passwordResetTokens.$inferInsert>)
      .where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Password must be 8-128 characters' },
        { status: 400 },
      );
    }
    console.error('Reset password error:', err);
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 },
    );
  }
}
