import { Occasion, WineRecommendation } from './wine';

export type TastingMode = 'food_to_wine' | 'wine_to_food';

export interface DishPairingRecommendation {
  dishName: string;
  cuisineType?: string;
  prepTimeBand?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  rationale: string;
  dishAttributes: string[];
}

interface BaseTastingPlanInput {
  mode: TastingMode;
  occasion: Occasion;
  specialRequest?: string;
}

export interface FoodToWineTastingPlanInput extends BaseTastingPlanInput {
  mode: 'food_to_wine';
  occasion: Occasion;
  foodPairing: string;
  regionPreferences: string[];
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  wineCount: number;
}

export interface WineToFoodTastingPlanInput extends BaseTastingPlanInput {
  mode: 'wine_to_food';
  wineInput: {
    type: 'style' | 'specific';
    value: string;
  };
  diet: 'none' | 'vegetarian' | 'vegan' | 'pescatarian';
  prepTime: '<30' | '30_60' | '60_plus';
  spiceLevel: 'mild' | 'medium' | 'high';
  dishBudgetMin: number;
  dishBudgetMax: number;
  cuisinePreferences: string[];
  guestCountBand: 'small' | 'medium' | 'large';
}

export type TastingPlanInput = FoodToWineTastingPlanInput | WineToFoodTastingPlanInput;

interface BaseTastingPlan {
  id: string;
  title: string;
  description: string;
  occasion: Occasion;
  mode: TastingMode;
  createdAt: string;
}

export interface FoodToWineTastingPlan extends BaseTastingPlan {
  mode: 'food_to_wine';
  foodPairing: string;
  regionPreferences: string[];
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  wineCount: number;
  wines: WineRecommendation[];
  tastingTips: string[];
  totalEstimatedCostMin: number;
  totalEstimatedCostMax: number;
}

export interface WineToFoodTastingPlan extends BaseTastingPlan {
  mode: 'wine_to_food';
  foodPairing: string;
  wineInput: {
    type: 'style' | 'specific';
    value: string;
  };
  diet: 'none' | 'vegetarian' | 'vegan' | 'pescatarian';
  prepTime: '<30' | '30_60' | '60_plus';
  spiceLevel: 'mild' | 'medium' | 'high';
  dishBudgetMin: number;
  dishBudgetMax: number;
  cuisinePreferences: string[];
  guestCountBand: 'small' | 'medium' | 'large';
  wineCount: number;
  wines: WineRecommendation[];
  pairings: DishPairingRecommendation[];
  hostTips: string[];
  tastingTips: string[];
  totalEstimatedCostMin: number;
  totalEstimatedCostMax: number;
}

export type TastingPlan = FoodToWineTastingPlan | WineToFoodTastingPlan;
