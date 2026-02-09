import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

import { OCCASIONS } from '@/common/constants/wine.const';
import { ANONYMOUS_FOOD_OPTIONS } from '@/common/constants/tier.const';
import { createDbClient } from '@/common/db/client';
import { tastingPlans, tastingPlanWines } from '@/common/db/schema';
import { TastingPlanInput } from '@/common/types/tasting';
import { Occasion } from '@/common/types/wine';
import { generatePlan } from '@/server/ai/generate-plan';
import { computeInputHash, getCachedPlan, setCachedPlan } from '@/server/cache/plan-cache';

interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  CACHE_WARMUP: Workflow;
}

interface Combo {
  occasion: Occasion;
  food: string;
  foodIndex: number;
}

export class CacheWarmupWorkflow extends WorkflowEntrypoint<Env> {
  async run(event: WorkflowEvent<void>, step: WorkflowStep) {
    // Step 1: Enumerate all 36 combos
    const combos = await step.do('enumerate', async () => {
      const result: Combo[] = [];
      for (const occ of OCCASIONS) {
        for (let fi = 0; fi < ANONYMOUS_FOOD_OPTIONS.length; fi++) {
          result.push({
            occasion: occ.value,
            food: ANONYMOUS_FOOD_OPTIONS[fi],
            foodIndex: fi,
          });
        }
      }
      return result;
    });

    const results: Array<{ combo: string; status: string; planId?: string }> = [];

    // Step 2: Generate each combo
    for (let i = 0; i < combos.length; i++) {
      const combo = combos[i];
      const stepName = `generate-${combo.occasion}-${combo.foodIndex}`;

      const result = await step.do(
        stepName,
        {
          retries: {
            limit: 3,
            delay: '10 seconds',
            backoff: 'exponential',
          },
        },
        async () => {
          const input: TastingPlanInput = {
            occasion: combo.occasion,
            foodPairing: combo.food,
            regionPreferences: [],
            budgetMin: 20,
            budgetMax: 40,
            budgetCurrency: 'USD',
            wineCount: 3,
          };

          const db = createDbClient(this.env.DB);
          const inputHash = await computeInputHash(input);

          // Check if already cached
          const cached = await getCachedPlan(db, inputHash);
          if (cached) {
            return { status: 'already_cached' as const, planId: cached.planId };
          }

          // Generate via AI
          const generatedPlan = await generatePlan(input, this.env.ANTHROPIC_API_KEY);

          // Store plan in D1
          const planId = crypto.randomUUID();
          const now = new Date().toISOString();

          const wines = generatedPlan.wines.map((wine, wi) => ({
            id: crypto.randomUUID(),
            planId,
            varietal: wine.varietal,
            region: wine.region,
            subRegion: wine.subRegion,
            yearRange: wine.yearRange,
            acidity: wine.flavorProfile.acidity,
            tannin: wine.flavorProfile.tannin,
            sweetness: wine.flavorProfile.sweetness,
            alcohol: wine.flavorProfile.alcohol,
            body: wine.flavorProfile.body,
            description: wine.description,
            pairingRationale: wine.pairingRationale,
            flavorNotes: wine.flavorNotes,
            tastingOrder: wine.tastingOrder || wi + 1,
            estimatedPriceMin: wine.estimatedPriceMin,
            estimatedPriceMax: wine.estimatedPriceMax,
            wineType: wine.wineType,
            createdAt: now,
          }));

          await db.insert(tastingPlans).values({
            id: planId,
            userId: null,
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
          } as typeof tastingPlans.$inferInsert);

          for (const wine of wines) {
            await db
              .insert(tastingPlanWines)
              .values(wine as typeof tastingPlanWines.$inferInsert);
          }

          // Cache with null TTL (never expires)
          await setCachedPlan(db, input, inputHash, planId, null);

          return { status: 'generated' as const, planId };
        },
      );

      results.push({
        combo: `${combo.occasion}/${combo.food}`,
        status: result.status,
        planId: result.planId,
      });

      // Rate limit pause between AI calls (skip after last combo)
      if (i < combos.length - 1 && result.status === 'generated') {
        await step.sleep(`pause-after-${i}`, '2 seconds');
      }
    }

    // Step 3: Summary
    const summary = await step.do('summary', async () => {
      const generated = results.filter((r) => r.status === 'generated').length;
      const skipped = results.filter((r) => r.status === 'already_cached').length;
      return {
        total: results.length,
        generated,
        skipped,
        results,
      };
    });

    return summary;
  }
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);

    if (url.pathname === '/trigger' || req.method === 'POST') {
      const instance = await env.CACHE_WARMUP.create();
      return Response.json({ instanceId: instance.id, status: 'started' });
    }

    if (url.pathname === '/status') {
      const id = url.searchParams.get('id');
      if (!id) {
        return Response.json({ error: 'id required' }, { status: 400 });
      }
      const instance = await env.CACHE_WARMUP.get(id);
      return Response.json(await instance.status());
    }

    return Response.json({ routes: ['/trigger', '/status?id=...'] });
  },
};
