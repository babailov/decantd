import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

export async function GET(request: NextRequest) {
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

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json(
      { message: 'Failed to check auth' },
      { status: 500 },
    );
  }
}
