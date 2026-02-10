import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createDbClient } from '@/common/db/client';
import { generationLogs, tastingPlanWines, tastingPlans } from '@/common/db/schema';
import { TastingPlanInput } from '@/common/types/tasting';

import { generatePlan } from '@/server/ai/generate-plan';
import { getUserFromRequest } from '@/server/auth/session';
import { computeInputHash, getCachedPlan, setCachedPlan } from '@/server/cache/plan-cache';
import { fetchPlanById } from '@/server/plans/fetch-plan';
import { canGenerate, resolveUserTier, getTierConfig } from '@/server/tier/resolve-tier';
import { validateInputForTier } from '@/server/tier/validate-input';

const inputSchema = z.object({
  occasion: z.enum(['dinner_party', 'date_night', 'casual', 'celebration', 'educational', 'business']),
  foodPairing: z.string(),
  regionPreferences: z.array(z.string()),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  budgetCurrency: z.string().default('USD'),
  wineCount: z.number().int().min(1).max(8),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse + validate input
    const body = await request.json();
    const input = inputSchema.parse(body) as TastingPlanInput;

    // 2. Get API key + DB
    let apiKey = '';
    let d1: D1Database | null = null;

    try {
      const ctx = await getCloudflareContext();
      apiKey = ctx.env.ANTHROPIC_API_KEY;
      d1 = ctx.env.DB;
    } catch {
      // Cloudflare context not available (local next dev without wrangler)
      apiKey = process.env.ANTHROPIC_API_KEY || '';
    }

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key not configured' },
        { status: 500 },
      );
    }

    // 3. Resolve user + tier
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

    // 4. Server-side validate input against tier
    const validation = validateInputForTier(input, tier);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 403 },
      );
    }

    // 5. Compute input hash
    const inputHash = await computeInputHash(input);

    // 6. Check cache
    if (db) {
      const cached = await getCachedPlan(db, inputHash);
      if (cached) {
        const cachedPlanData = await fetchPlanById(db, cached.planId);
        if (cachedPlanData) {
          // Log cache hit for authenticated users
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

    // 7. Rate limit check (only for authenticated free users)
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

    // 8. Generate via AI
    const generatedPlan = await generatePlan(input, apiKey);

    // 9. Store plan in D1
    const planId = crypto.randomUUID();
    const now = new Date().toISOString();

    const wines = generatedPlan.wines.map((wine, i) => ({
      id: crypto.randomUUID(),
      planId,
      ...wine,
      acidity: wine.flavorProfile.acidity,
      tannin: wine.flavorProfile.tannin,
      sweetness: wine.flavorProfile.sweetness,
      alcohol: wine.flavorProfile.alcohol,
      body: wine.flavorProfile.body,
      tastingOrder: wine.tastingOrder || i + 1,
    }));

    if (db) {
      const planValues = {
        id: planId,
        userId: user?.id || null,
        occasion: input.occasion,
        foodPairing: input.foodPairing,
        regionPreferences: input.regionPreferences,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        budgetCurrency: input.budgetCurrency,
        wineCount: input.wineCount,
        generatedPlan: generatedPlan,
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

      // 10. Store in cache
      await setCachedPlan(db, input, inputHash, planId, tierConfig.cacheTtlHours);

      // 11. Log generation
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

    // 12. Return plan response
    const plan = {
      id: planId,
      title: generatedPlan.title,
      description: generatedPlan.description,
      occasion: input.occasion,
      foodPairing: input.foodPairing,
      regionPreferences: input.regionPreferences,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      budgetCurrency: input.budgetCurrency,
      wineCount: input.wineCount,
      wines: generatedPlan.wines.map((wine, i) => ({
        id: wines[i].id,
        wineName: wine.wineName,
        ...wine,
        tastingOrder: wine.tastingOrder || i + 1,
      })),
      tastingTips: generatedPlan.tastingTips,
      totalEstimatedCostMin: generatedPlan.totalEstimatedCostMin,
      totalEstimatedCostMax: generatedPlan.totalEstimatedCostMax,
      createdAt: now,
    };

    return NextResponse.json(plan);
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
