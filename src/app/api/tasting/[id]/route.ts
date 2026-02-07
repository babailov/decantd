import { getCloudflareContext } from '@opennextjs/cloudflare';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { createDbClient } from '@/common/db/client';
import { tastingPlanWines, tastingPlans } from '@/common/db/schema';

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

    const plan = await db.query.tastingPlans.findFirst({
      where: eq(tastingPlans.id, id),
    });

    if (!plan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 404 },
      );
    }

    const wines = await db.query.tastingPlanWines.findMany({
      where: eq(tastingPlanWines.planId, id),
      orderBy: (wines, { asc }) => [asc(wines.tastingOrder)],
    });

    const wineResponses = wines.map((wine) => ({
      id: wine.id,
      varietal: wine.varietal,
      region: wine.region,
      subRegion: wine.subRegion,
      yearRange: wine.yearRange,
      wineType: wine.wineType as 'red' | 'white' | 'rose' | 'sparkling',
      description: wine.description,
      pairingRationale: wine.pairingRationale,
      flavorNotes: wine.flavorNotes,
      flavorProfile: {
        acidity: wine.acidity,
        tannin: wine.tannin,
        sweetness: wine.sweetness,
        alcohol: wine.alcohol,
        body: wine.body,
      },
      estimatedPriceMin: wine.estimatedPriceMin,
      estimatedPriceMax: wine.estimatedPriceMax,
      tastingOrder: wine.tastingOrder,
    }));

    const generatedPlan = plan.generatedPlan as {
      tastingTips?: string[];
      totalEstimatedCostMin?: number;
      totalEstimatedCostMax?: number;
    };

    return NextResponse.json({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      occasion: plan.occasion,
      foodPairing: plan.foodPairing,
      regionPreferences: plan.regionPreferences,
      budgetMin: plan.budgetMin,
      budgetMax: plan.budgetMax,
      budgetCurrency: plan.budgetCurrency,
      wineCount: plan.wineCount,
      wines: wineResponses,
      tastingTips: generatedPlan?.tastingTips || [],
      totalEstimatedCostMin: generatedPlan?.totalEstimatedCostMin || 0,
      totalEstimatedCostMax: generatedPlan?.totalEstimatedCostMax || 0,
      createdAt: plan.createdAt,
    });
  } catch (err) {
    console.error('Get plan error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch plan' },
      { status: 500 },
    );
  }
}
