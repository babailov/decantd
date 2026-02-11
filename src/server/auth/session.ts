import { eq, and, gt } from 'drizzle-orm';

import { DbClient } from '@/common/db/client';
import { sessions, users } from '@/common/db/schema';
import { User } from '@/common/types/auth';

const SESSION_DURATION_DAYS = 30;
const TOKEN_HEADER = 'x-auth-token';
const TOKEN_COOKIE = 'decantd-session';

export function getTokenFromRequest(request: Request): string | null {
  // Check header first, then cookie
  const headerToken = request.headers.get(TOKEN_HEADER);
  if (headerToken) return headerToken;

  const cookies = request.headers.get('cookie');
  if (!cookies) return null;

  const match = cookies.match(new RegExp(`${TOKEN_COOKIE}=([^;]+)`));
  return match?.[1] || null;
}

export async function getUserFromRequest(
  request: Request,
  db: DbClient,
): Promise<User | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const now = new Date().toISOString();

  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.token, token),
      gt(sessions.expiresAt, now),
    ),
  });

  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) return null;

  return {
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
  };
}

export async function createSession(
  db: DbClient,
  userId: string,
): Promise<{ token: string; expiresAt: string }> {
  const token = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function deleteSession(
  db: DbClient,
  token: string,
): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export function setSessionCookie(token: string, expiresAt: string): string {
  const expires = new Date(expiresAt).toUTCString();
  return `${TOKEN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

export function clearSessionCookie(): string {
  return `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
