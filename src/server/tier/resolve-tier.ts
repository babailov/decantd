import { and, eq, gte, sql } from 'drizzle-orm';

import { TIER_CONFIGS } from '@/common/constants/tier.const';
import { DbClient } from '@/common/db/client';
import { generationLogs } from '@/common/db/schema';
import { User } from '@/common/types/auth';
import { SubscriptionTier, TierConfig } from '@/common/types/tier';

export function resolveUserTier(user: User | null): SubscriptionTier {
  if (!user) return 'anonymous';
  return user.subscriptionTier || 'free';
}

export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIER_CONFIGS[tier];
}

export async function getDailyGenerationCount(
  db: DbClient,
  userId: string,
): Promise<number> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  // Format as SQLite datetime (space-separated, no T/Z) to match DB values
  const todayStartStr = todayStart.toISOString().replace('T', ' ').replace('Z', '');

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(generationLogs)
    .where(
      and(
        eq(generationLogs.userId, userId),
        gte(generationLogs.createdAt, todayStartStr),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function canGenerate(
  db: DbClient,
  user: User | null,
): Promise<{ allowed: boolean; remaining: number | null; reason?: string }> {
  const tier = resolveUserTier(user);
  const config = getTierConfig(tier);

  if (tier === 'anonymous') {
    return { allowed: true, remaining: null };
  }

  if (config.dailyGenerationLimit === null) {
    return { allowed: true, remaining: null };
  }

  const used = await getDailyGenerationCount(db, user!.id);
  const remaining = Math.max(0, config.dailyGenerationLimit - used);

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Daily limit of ${config.dailyGenerationLimit} tastings reached. Try again tomorrow or upgrade for unlimited.`,
    };
  }

  return { allowed: true, remaining };
}
