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
    const { token } = await createSession(db, dbUser.id);

    // @opennextjs/cloudflare strips Set-Cookie from navigation responses
    // (302 redirects, meta-refresh HTML, etc.). Instead, return an HTML page
    // with inline JS that performs a fetch() to /api/auth/token-exchange —
    // fetch() responses preserve Set-Cookie headers (proven by login route).
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Signing in...</title>
  <style>
    :root {
      --color-background: #FAF7F2;
      --color-surface: #F5F0E8;
      --color-surface-elevated: #FFFFFF;
      --color-primary: #7B2D3A;
      --color-accent: #C4953A;
      --color-text-primary: #2D2926;
      --color-text-secondary: #5C5650;
      --color-text-on-primary: #FFF8F6;
      --shadow-card: 0 22px 42px -28px rgba(123, 45, 58, 0.3);
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, var(--color-background) 0%, var(--color-surface) 60%, #EDE7DC 100%);
      font-family: "Source Sans 3", "Source Sans Pro", system-ui, -apple-system, sans-serif;
      color: var(--color-text-primary);
      position: relative;
      overflow: hidden;
    }

    body::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(ellipse at 50% 0%, rgba(196, 149, 58, 0.08) 0%, transparent 60%);
    }

    .container {
      text-align: center;
      background: var(--color-surface-elevated);
      border: 1px solid rgba(212, 204, 192, 0.7);
      border-radius: 20px;
      padding: 28px 32px;
      box-shadow: var(--shadow-card);
      position: relative;
      z-index: 1;
      max-width: 320px;
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(123, 45, 58, 0.2);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    #status {
      margin: 0;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p id="status">Completing sign in...</p>
  </div>
  <script>
    (async function() {
      try {
        const res = await fetch('/api/auth/token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: '${token}' }),
        });
        if (!res.ok) throw new Error('Token exchange failed');
        const data = await res.json();
        localStorage.setItem('decantd-auth', JSON.stringify({
          state: { user: data.user, token: data.token },
          version: 0,
        }));
        window.location.href = '/';
      } catch (e) {
        document.getElementById('status').innerHTML =
          'Sign in failed. <a href="/?auth_error=oauth_error" style="color:#a88767;">Return home</a>';
      }
    })();
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/?auth_error=oauth_error', request.url),
    );
  }
}
