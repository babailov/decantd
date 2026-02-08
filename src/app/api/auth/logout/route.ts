import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/server/auth/get-db';
import {
  clearSessionCookie,
  deleteSession,
  getTokenFromRequest,
} from '@/server/auth/session';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (token) {
      const db = await getDb();
      if (db) {
        await deleteSession(db, token);
      }
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearSessionCookie());
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearSessionCookie());
    return response;
  }
}
