import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createDbClient } from '@/common/db/client';
import { generationLogs, tastingPlanWines, tastingPlans } from '@/common/db/schema';
import {
  FoodToWineTastingPlanInput,
  TastingPlanInput,
} from '@/common/types/tasting';

import {
  FoodToWineGeneratedPlanResponse,
  generatePlan,
  WineToFoodGeneratedPlanResponse,
} from '@/server/ai/generate-plan';
import { getUserFromRequest } from '@/server/auth/session';
import { computeInputHash, getCachedPlan, setCachedPlan } from '@/server/cache/plan-cache';
import { fetchPlanById } from '@/server/plans/fetch-plan';
import { canGenerate, getTierConfig, resolveUserTier } from '@/server/tier/resolve-tier';
import { validateInputForTier } from '@/server/tier/validate-input';

const foodToWineInputSchema = z.object({
  mode: z.literal('food_to_wine').default('food_to_wine'),
  occasion: z.enum(['dinner_party', 'date_night', 'casual', 'celebration', 'educational', 'business']),
  foodPairing: z.string(),
  regionPreferences: z.array(z.string()),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  budgetCurrency: z.string().default('USD'),
  wineCount: z.number().int().min(1).max(8),
  specialRequest: z.string().max(300).optional(),
});

const wineToFoodInputSchema = z.object({
  mode: z.literal('wine_to_food'),
  occasion: z.enum(['dinner_party', 'date_night', 'casual', 'celebration', 'educational', 'business']),
  wineInput: z.object({
    type: z.enum(['style', 'specific']),
    value: z.string().min(1),
  }),
  diet: z.enum(['none', 'vegetarian', 'vegan', 'pescatarian']),
  prepTime: z.enum(['<30', '30_60', '60_plus']),
  spiceLevel: z.enum(['mild', 'medium', 'high']),
  dishBudgetMin: z.number().positive(),
  dishBudgetMax: z.number().positive(),
  cuisinePreferences: z.array(z.string()),
  guestCountBand: z.enum(['small', 'medium', 'large']),
  specialRequest: z.string().max(300).optional(),
});

const inputSchema = z.union([foodToWineInputSchema, wineToFoodInputSchema]);

function normalizeInput(body: unknown): TastingPlanInput {
  if (
    typeof body === 'object' &&
    body !== null &&
    !('mode' in body)
  ) {
    return foodToWineInputSchema.parse({ ...body, mode: 'food_to_wine' }) as FoodToWineTastingPlanInput;
  }
  return inputSchema.parse(body) as TastingPlanInput;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = normalizeInput(body);

    let apiKey = '';
    let d1: D1Database | null = null;

    try {
      const ctx = await getCloudflareContext();
      apiKey = ctx.env.ANTHROPIC_API_KEY || '';
      d1 = ctx.env.DB;
    } catch {
      apiKey = process.env.ANTHROPIC_API_KEY || '';
    }

    let user = null;
    const db = d1 ? createDbClient(d1) : null;

    if (db) {
      try {
        user = await getUserFromRequest(request, db);
      } catch {
        // Not authenticated
      }
    }

    const tier = resolveUserTier(user);
    const tierConfig = getTierConfig(tier);

    const validation = validateInputForTier(input, tier);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 403 },
      );
    }

    const inputHash = await computeInputHash(input);

    if (db) {
      const cached = await getCachedPlan(db, inputHash);
      if (cached) {
        const cachedPlanData = await fetchPlanById(db, cached.planId);
        if (cachedPlanData) {
          if (user) {
            await db.insert(generationLogs).values({
              id: crypto.randomUUID(),
              userId: user.id,
              inputHash,
              planId: cached.planId,
              wasCacheHit: true,
            } as typeof generationLogs.$inferInsert);
          }
          return NextResponse.json({ ...cachedPlanData, cached: true });
        }
      }
    }

    if (tier === 'anonymous') {
      return NextResponse.json(
        { message: 'This tasting plan is being prepared. Please try again in a few minutes, or sign up for instant custom plans.' },
        { status: 503 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key not configured' },
        { status: 500 },
      );
    }

    if (db && user) {
      const rateCheck = await canGenerate(db, user);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            message: rateCheck.reason,
            remaining: 0,
            limit: tierConfig.dailyGenerationLimit,
          },
          { status: 429 },
        );
      }
    }

    const generatedPlan = await generatePlan(input, apiKey);
    const planId = crypto.randomUUID();
    const now = new Date().toISOString();

    const foodToWinePlan = input.mode === 'food_to_wine'
      ? generatedPlan as FoodToWineGeneratedPlanResponse
      : null;
    const wineToFoodPlan = input.mode === 'wine_to_food'
      ? generatedPlan as WineToFoodGeneratedPlanResponse
      : null;

    const wines = input.mode === 'food_to_wine' && foodToWinePlan
      ? foodToWinePlan.wines.map((wine, i) => ({
          id: crypto.randomUUID(),
          planId,
          ...wine,
          acidity: wine.flavorProfile.acidity,
          tannin: wine.flavorProfile.tannin,
          sweetness: wine.flavorProfile.sweetness,
          alcohol: wine.flavorProfile.alcohol,
          body: wine.flavorProfile.body,
          tastingOrder: wine.tastingOrder || i + 1,
        }))
      : [];

    if (db) {
      const planValues = {
        id: planId,
        userId: user?.id || null,
        occasion: input.occasion,
        foodPairing: input.mode === 'food_to_wine' ? input.foodPairing : input.wineInput.value,
        regionPreferences: input.mode === 'food_to_wine' ? input.regionPreferences : [],
        budgetMin: input.mode === 'food_to_wine' ? input.budgetMin : input.dishBudgetMin,
        budgetMax: input.mode === 'food_to_wine' ? input.budgetMax : input.dishBudgetMax,
        budgetCurrency: input.mode === 'food_to_wine' ? input.budgetCurrency : 'USD',
        wineCount: input.mode === 'food_to_wine' ? input.wineCount : 1,
        generatedPlan: {
          ...generatedPlan,
          mode: input.mode,
          inputSnapshot: input.mode === 'wine_to_food' ? input : undefined,
        },
        title: generatedPlan.title,
        description: generatedPlan.description,
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(tastingPlans).values(planValues as typeof tastingPlans.$inferInsert);

      for (const wine of wines) {
        const wineValues = {
          id: wine.id,
          planId: wine.planId,
          varietal: wine.varietal,
          region: wine.region,
          subRegion: wine.subRegion,
          yearRange: wine.yearRange,
          acidity: wine.acidity,
          tannin: wine.tannin,
          sweetness: wine.sweetness,
          alcohol: wine.alcohol,
          body: wine.body,
          description: wine.description,
          pairingRationale: wine.pairingRationale,
          flavorNotes: wine.flavorNotes,
          tastingOrder: wine.tastingOrder,
          estimatedPriceMin: wine.estimatedPriceMin,
          estimatedPriceMax: wine.estimatedPriceMax,
          wineType: wine.wineType,
          createdAt: now,
        };
        await db.insert(tastingPlanWines).values(wineValues as typeof tastingPlanWines.$inferInsert);
      }

      await setCachedPlan(db, input, inputHash, planId, tierConfig.cacheTtlHours);

      if (user) {
        await db.insert(generationLogs).values({
          id: crypto.randomUUID(),
          userId: user.id,
          inputHash,
          planId,
          wasCacheHit: false,
        } as typeof generationLogs.$inferInsert);
      }
    }

    if (input.mode === 'food_to_wine') {
      if (!foodToWinePlan) {
        throw new Error('Invalid generated plan shape for food-to-wine mode');
      }
      const plan = {
        id: planId,
        mode: 'food_to_wine' as const,
        title: foodToWinePlan.title,
        description: foodToWinePlan.description,
        occasion: input.occasion,
        foodPairing: input.foodPairing,
        regionPreferences: input.regionPreferences,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        budgetCurrency: input.budgetCurrency,
        wineCount: input.wineCount,
        wines: foodToWinePlan.wines.map((wine, i) => ({
          id: wines[i].id,
          wineName: wine.wineName,
          ...wine,
          tastingOrder: wine.tastingOrder || i + 1,
        })),
        tastingTips: foodToWinePlan.tastingTips,
        totalEstimatedCostMin: foodToWinePlan.totalEstimatedCostMin,
        totalEstimatedCostMax: foodToWinePlan.totalEstimatedCostMax,
        createdAt: now,
      };
      return NextResponse.json(plan);
    }

    if (!wineToFoodPlan) {
      throw new Error('Invalid generated plan shape for wine-to-food mode');
    }

    const reversePlan = {
      id: planId,
      mode: 'wine_to_food' as const,
      title: wineToFoodPlan.title,
      description: wineToFoodPlan.description,
      occasion: input.occasion,
      foodPairing: input.wineInput.value,
      wineInput: input.wineInput,
      diet: input.diet,
      prepTime: input.prepTime,
      spiceLevel: input.spiceLevel,
      dishBudgetMin: input.dishBudgetMin,
      dishBudgetMax: input.dishBudgetMax,
      cuisinePreferences: input.cuisinePreferences,
      guestCountBand: input.guestCountBand,
      wineCount: 1,
      wines: [],
      pairings: wineToFoodPlan.pairings,
      hostTips: wineToFoodPlan.hostTips,
      tastingTips: [],
      totalEstimatedCostMin: wineToFoodPlan.totalEstimatedCostMin,
      totalEstimatedCostMax: wineToFoodPlan.totalEstimatedCostMax,
      createdAt: now,
    };

    return NextResponse.json(reversePlan);
  } catch (err) {
    console.error('Plan generation error:', err);
    const message =
      err instanceof z.ZodError
        ? 'Invalid input'
        : err instanceof Error
          ? err.message
          : 'Failed to generate plan';

    return NextResponse.json({ message }, { status: 500 });
  }
}
