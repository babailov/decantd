import { NextRequest, NextResponse } from 'next/server';

import {
  generateOAuthState,
  getGoogleOAuthConfig,
} from '@/server/auth/oauth';

const STATE_COOKIE = 'decantd-oauth-state';
const STATE_MAX_AGE = 600; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const config = await getGoogleOAuthConfig();
    if (!config.clientId) {
      return NextResponse.redirect(
        new URL('/?auth_error=oauth_not_configured', request.url),
      );
    }

    const state = generateOAuthState();
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'select_account',
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const response = NextResponse.redirect(googleAuthUrl);
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: STATE_MAX_AGE,
      secure: true,
    });

    return response;
  } catch (err) {
    console.error('Google OAuth initiate error:', err);
    return NextResponse.redirect(
      new URL('/?auth_error=oauth_error', request.url),
    );
  }
}
