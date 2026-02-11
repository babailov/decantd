import { getCloudflareContext } from '@opennextjs/cloudflare';

import { isDevEnvironment } from '@/common/constants/environment';

interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export async function getGoogleOAuthConfig(): Promise<GoogleOAuthConfig> {
  if (isDevEnvironment) {
    try {
      const ctx = await getCloudflareContext();
      return {
        clientId: ctx.env.GOOGLE_CLIENT_ID || '',
        clientSecret: ctx.env.GOOGLE_CLIENT_SECRET || '',
      };
    } catch {
      return {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      };
    }
  }

  const { env } = await getCloudflareContext();
  return {
    clientId: env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || '',
  };
}

export function generateOAuthState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  config: GoogleOAuthConfig,
): Promise<{ access_token: string; id_token?: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  return response.json();
}
