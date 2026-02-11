import { eq, and, or, isNull, gt } from 'drizzle-orm';

import { DbClient } from '@/common/db/client';
import { cachedPlans } from '@/common/db/schema';
import { TastingPlanInput } from '@/common/types/tasting';

export async function computeInputHash(input: TastingPlanInput): Promise<string> {
  const normalized = {
    occasion: input.occasion,
    foodPairing: input.foodPairing.toLowerCase().trim(),
    regionPreferences: [...input.regionPreferences].sort(),
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    wineCount: input.wineCount,
    specialRequest: input.specialRequest?.toLowerCase().trim() || '',
  };

  const data = new TextEncoder().encode(JSON.stringify(normalized));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getCachedPlan(
  db: DbClient,
  inputHash: string,
): Promise<{ planId: string } | null> {
  const now = new Date().toISOString();

  const cached = await db.query.cachedPlans.findFirst({
    where: and(
      eq(cachedPlans.inputHash, inputHash),
      or(isNull(cachedPlans.expiresAt), gt(cachedPlans.expiresAt, now)),
    ),
  });

  if (!cached) return null;
  return { planId: cached.planId };
}

export async function setCachedPlan(
  db: DbClient,
  input: TastingPlanInput,
  inputHash: string,
  planId: string,
  ttlHours: number | null,
): Promise<void> {
  const expiresAt = ttlHours
    ? new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()
    : null;

  await db.insert(cachedPlans).values({
    id: crypto.randomUUID(),
    inputHash,
    occasion: input.occasion,
    foodPairing: input.foodPairing,
    regionPreferences: input.regionPreferences,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    wineCount: input.wineCount,
    planId,
    expiresAt,
  } as typeof cachedPlans.$inferInsert);
}
