import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { isDevEnvironment } from '@/common/constants/environment';
import { createDbClient } from '@/common/db/client';
import { tastingPlanWines, tastingPlans } from '@/common/db/schema';
import { TastingPlanInput } from '@/common/types/tasting';

import { generatePlan } from '@/server/ai/generate-plan';

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
    const body = await request.json();
    const input = inputSchema.parse(body) as TastingPlanInput;

    // Get API key — dual-environment pattern
    let apiKey: string;
    let d1: D1Database | null = null;

    if (isDevEnvironment) {
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      // In local dev, try to get D1 from Cloudflare context (wrangler proxy)
      try {
        const ctx = await getCloudflareContext();
        d1 = ctx.env.DB;
      } catch {
        // D1 not available locally, will skip DB storage
      }
    } else {
      const { env } = await getCloudflareContext();
      apiKey = env.ANTHROPIC_API_KEY;
      d1 = env.DB;
    }

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key not configured' },
        { status: 500 },
      );
    }

    // Generate the plan via Claude
    const generatedPlan = await generatePlan(input, apiKey);

    // Create unique IDs
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

    // Store in D1 if available
    if (d1) {
      const db = createDbClient(d1);

      const planValues = {
        id: planId,
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
    }

    // Build the full response
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
