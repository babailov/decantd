import { eq } from 'drizzle-orm';

import { DbClient } from '@/common/db/client';
import { tastingPlanWines, tastingPlans } from '@/common/db/schema';

export async function fetchPlanById(db: DbClient, planId: string) {
  const plan = await db.query.tastingPlans.findFirst({
    where: eq(tastingPlans.id, planId),
  });

  if (!plan) return null;

  const wines = await db.query.tastingPlanWines.findMany({
    where: eq(tastingPlanWines.planId, planId),
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

  return {
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
  };
}
