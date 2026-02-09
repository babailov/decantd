import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { passwordResetTokens, users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { generateResetToken } from '@/server/auth/token';
import { sendEmail } from '@/server/email/send-email';
import { getPasswordResetEmail } from '@/server/email/templates/password-reset';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = forgotPasswordSchema.parse(body);

    const db = await getDb();
    if (!db) {
      // Always return success to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (user) {
      const { raw, hash } = await generateResetToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString();

      await db.insert(passwordResetTokens).values({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash: hash,
        expiresAt,
      } as typeof passwordResetTokens.$inferInsert);

      const origin = request.headers.get('origin') || 'https://decantd.app';
      const resetUrl = `${origin}/reset-password?token=${raw}`;
      const { subject, html } = getPasswordResetEmail(resetUrl);

      await sendEmail({ to: user.email, subject, html });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email' },
        { status: 400 },
      );
    }
    console.error('Forgot password error:', err);
    // Still return success to prevent information leakage
    return NextResponse.json({ success: true });
  }
}
