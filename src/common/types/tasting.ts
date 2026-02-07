import { Occasion, WineRecommendation } from './wine';

export interface TastingPlanInput {
  occasion: Occasion;
  foodPairing: string;
  regionPreferences: string[];
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  wineCount: number;
}

export interface TastingPlan {
  id: string;
  title: string;
  description: string;
  occasion: Occasion;
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
  createdAt: string;
}
