import { ANONYMOUS_FOOD_OPTIONS } from '@/common/constants/tier.const';
import { TastingPlanInput } from '@/common/types/tasting';
import { SubscriptionTier } from '@/common/types/tier';

import { getTierConfig } from './resolve-tier';

export function validateInputForTier(
  input: TastingPlanInput,
  tier: SubscriptionTier,
): { valid: boolean; error?: string } {
  const config = getTierConfig(tier);

  if (input.specialRequest && !config.allowSpecialRequests) {
    return {
      valid: false,
      error: 'Upgrade to add custom sommelier requests and advanced tasting refinements.',
    };
  }

  if (tier !== 'anonymous') {
    return { valid: true };
  }

  if (!ANONYMOUS_FOOD_OPTIONS.includes(input.foodPairing)) {
    return {
      valid: false,
      error: 'Sign up for custom food pairings. Anonymous users can only choose from preset options.',
    };
  }

  if (input.regionPreferences.length > 0) {
    return {
      valid: false,
      error: 'Sign up to choose specific wine regions. Anonymous users use "Surprise me!" mode.',
    };
  }

  if (input.budgetMin !== 20 || input.budgetMax !== 40) {
    return {
      valid: false,
      error: 'Sign up for more budget options. Anonymous users use the $20-40 range.',
    };
  }

  if (input.wineCount !== 3) {
    return {
      valid: false,
      error: 'Sign up to choose your wine count. Anonymous users receive 3 wines.',
    };
  }

  return { valid: true };
}
