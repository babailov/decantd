import { TIER_CONFIGS } from '@/common/constants/tier.const';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { SubscriptionTier, TierConfig } from '@/common/types/tier';

export function useUserTier(): SubscriptionTier {
  const user = useAuthStore((s) => s.user);
  if (!user) return 'anonymous';
  return user.subscriptionTier || 'free';
}

export function useTierConfig(): TierConfig {
  const tier = useUserTier();
  return TIER_CONFIGS[tier];
}
