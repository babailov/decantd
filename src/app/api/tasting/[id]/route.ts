import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

import { createDbClient } from '@/common/db/client';

import { fetchPlanById } from '@/server/plans/fetch-plan';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let d1: D1Database;
    try {
      const { env } = await getCloudflareContext();
      d1 = env.DB;
    } catch {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const db = createDbClient(d1);
    const plan = await fetchPlanById(db, id);

    if (!plan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(plan);
  } catch (err) {
    console.error('Get plan error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch plan' },
      { status: 500 },
    );
  }
}
