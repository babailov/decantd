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
    mode?: 'food_to_wine' | 'wine_to_food';
    tastingTips?: string[];
    totalEstimatedCostMin?: number;
    totalEstimatedCostMax?: number;
    pairings?: Array<{
      dishName: string;
      cuisineType?: string;
      prepTimeBand?: string;
      estimatedCostMin?: number;
      estimatedCostMax?: number;
      rationale: string;
      dishAttributes: string[];
    }>;
    hostTips?: string[];
    inputSnapshot?: {
      wineInput?: { type: 'style' | 'specific'; value: string };
      diet?: 'none' | 'vegetarian' | 'vegan' | 'pescatarian';
      prepTime?: '<30' | '30_60' | '60_plus';
      spiceLevel?: 'mild' | 'medium' | 'high';
      dishBudgetMin?: number;
      dishBudgetMax?: number;
      cuisinePreferences?: string[];
      guestCountBand?: 'small' | 'medium' | 'large';
    };
  };

  if (generatedPlan?.mode === 'wine_to_food') {
    return {
      id: plan.id,
      mode: 'wine_to_food' as const,
      title: plan.title,
      description: plan.description,
      occasion: plan.occasion,
      foodPairing: plan.foodPairing,
      wineInput: generatedPlan.inputSnapshot?.wineInput || { type: 'style' as const, value: plan.foodPairing },
      diet: generatedPlan.inputSnapshot?.diet || 'none',
      prepTime: generatedPlan.inputSnapshot?.prepTime || '30_60',
      spiceLevel: generatedPlan.inputSnapshot?.spiceLevel || 'medium',
      dishBudgetMin: generatedPlan.inputSnapshot?.dishBudgetMin || plan.budgetMin,
      dishBudgetMax: generatedPlan.inputSnapshot?.dishBudgetMax || plan.budgetMax,
      cuisinePreferences: generatedPlan.inputSnapshot?.cuisinePreferences || [],
      guestCountBand: generatedPlan.inputSnapshot?.guestCountBand || 'medium',
      wineCount: 1,
      wines: [],
      pairings: generatedPlan?.pairings || [],
      hostTips: generatedPlan?.hostTips || [],
      tastingTips: [],
      totalEstimatedCostMin: generatedPlan?.totalEstimatedCostMin || 0,
      totalEstimatedCostMax: generatedPlan?.totalEstimatedCostMax || 0,
      createdAt: plan.createdAt,
    };
  }

  return {
    id: plan.id,
    mode: 'food_to_wine' as const,
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
