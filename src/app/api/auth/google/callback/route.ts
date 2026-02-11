import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  getGoogleOAuthConfig,
} from '@/server/auth/oauth';
import { createSession } from '@/server/auth/session';

const STATE_COOKIE = 'decantd-oauth-state';
const OAUTH_NO_PASSWORD = 'OAUTH_NO_PASSWORD';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // User denied consent or Google returned an error
  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${error}`, request.url),
    );
  }

  // Validate required params
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/?auth_error=missing_params', request.url),
    );
  }

  // CSRF check: compare state param with cookie
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/?auth_error=invalid_state', request.url),
    );
  }

  try {
    const config = await getGoogleOAuthConfig();
    const origin = url.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri, config);

    // Fetch user info from Google
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);
    if (!googleUser.email || !googleUser.verified_email) {
      return NextResponse.redirect(
        new URL('/?auth_error=email_not_verified', request.url),
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.redirect(
        new URL('/?auth_error=db_unavailable', request.url),
      );
    }

    // 1. Look up by OAuth provider + id
    let dbUser = await db.query.users.findFirst({
      where: and(
        eq(users.oauthProvider, 'google'),
        eq(users.oauthId, googleUser.id),
      ),
    });

    if (!dbUser) {
      // 2. Look up by email — link existing account
      dbUser = await db.query.users.findFirst({
        where: eq(users.email, googleUser.email.toLowerCase()),
      });

      if (dbUser) {
        // Link Google to existing account
        await db
          .update(users)
          .set({
            oauthProvider: 'google',
            oauthId: googleUser.id,
            avatarUrl: dbUser.avatarUrl || googleUser.picture || null,
            updatedAt: new Date().toISOString(),
          } as Partial<typeof users.$inferInsert>)
          .where(eq(users.id, dbUser.id));
      } else {
        // 3. Create new user
        const userId = crypto.randomUUID();
        const displayName =
          googleUser.name || googleUser.email.split('@')[0];

        await db.insert(users).values({
          id: userId,
          email: googleUser.email.toLowerCase(),
          passwordHash: OAUTH_NO_PASSWORD,
          displayName,
          avatarUrl: googleUser.picture || null,
          oauthProvider: 'google',
          oauthId: googleUser.id,
        } as typeof users.$inferInsert);

        dbUser = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });
      }
    }

    if (!dbUser) {
      return NextResponse.redirect(
        new URL('/?auth_error=user_creation_failed', request.url),
      );
    }

    // Create session
    const { token, expiresAt } = await createSession(db, dbUser.id);

    const response = NextResponse.redirect(new URL('/', request.url));

    // Set session cookie
    response.cookies.set('decantd-session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      expires: new Date(expiresAt),
    });

    // Clear the state cookie
    response.cookies.set(STATE_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/?auth_error=oauth_error', request.url),
    );
  }
}
