export type SubscriptionTier = 'anonymous' | 'free' | 'paid';
export type BillingStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export interface TierConfig {
  tier: SubscriptionTier;
  allowCustomFoodText: boolean;
  foodOptions: string[];
  forceSurpriseMe: boolean;
  allowCustomBudget: boolean;
  budgetPresets: { label: string; min: number; max: number }[];
  fixedWineCount: number | null;
  wineCountMax: number;
  dailyGenerationLimit: number | null;
  cacheTtlHours: number | null;
}
