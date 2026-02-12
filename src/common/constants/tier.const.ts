import { TierConfig } from '@/common/types/tier';

export const ANONYMOUS_FOOD_OPTIONS = [
  'Steak & grilled meats',
  'Pasta & Italian',
  'Seafood & fish',
  'Cheese board',
  'Charcuterie',
  'No food — wine only',
];

export const TIER_CONFIGS: Record<string, TierConfig> = {
  anonymous: {
    tier: 'anonymous',
    allowCustomFoodText: false,
    allowSpecialRequests: false,
    foodOptions: ANONYMOUS_FOOD_OPTIONS,
    forceSurpriseMe: true,
    allowCustomBudget: false,
    budgetPresets: [{ label: '$20–40', min: 20, max: 40 }],
    fixedWineCount: 3,
    wineCountMax: 3,
    dailyGenerationLimit: null,
    cacheTtlHours: null,
  },
  free: {
    tier: 'free',
    allowCustomFoodText: true,
    allowSpecialRequests: false,
    foodOptions: [],
    forceSurpriseMe: false,
    allowCustomBudget: true,
    budgetPresets: [
      { label: '$10–20', min: 10, max: 20 },
      { label: '$20–40', min: 20, max: 40 },
      { label: '$40–80', min: 40, max: 80 },
      { label: '$80+', min: 80, max: 200 },
    ],
    fixedWineCount: null,
    wineCountMax: 8,
    dailyGenerationLimit: 10,
    cacheTtlHours: 24,
  },
  paid: {
    tier: 'paid',
    allowCustomFoodText: true,
    allowSpecialRequests: true,
    foodOptions: [],
    forceSurpriseMe: false,
    allowCustomBudget: true,
    budgetPresets: [
      { label: '$10–20', min: 10, max: 20 },
      { label: '$20–40', min: 20, max: 40 },
      { label: '$40–80', min: 40, max: 80 },
      { label: '$80+', min: 80, max: 200 },
    ],
    fixedWineCount: null,
    wineCountMax: 8,
    dailyGenerationLimit: null,
    cacheTtlHours: 24,
  },
};
