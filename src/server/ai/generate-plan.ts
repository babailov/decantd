import { z } from 'zod';

import {
  FoodToWineTastingPlanInput,
  TastingPlanInput,
  WineToFoodTastingPlanInput,
} from '@/common/types/tasting';

import {
  buildTastingPlanUserPrompt,
  TASTING_PLAN_SYSTEM_PROMPT,
} from './prompts/tasting-plan';
import {
  buildWineToFoodUserPrompt,
  WINE_TO_FOOD_SYSTEM_PROMPT,
} from './prompts/wine-to-food';

const flavorProfileSchema = z.object({
  acidity: z.number().min(0).max(5),
  tannin: z.number().min(0).max(5),
  sweetness: z.number().min(0).max(5),
  alcohol: z.number().min(0).max(5),
  body: z.number().min(0).max(5),
});

const wineSchema = z.object({
  wineName: z.string().optional(),
  varietal: z.string(),
  region: z.string(),
  subRegion: z.string().optional(),
  yearRange: z.string().optional(),
  wineType: z.enum(['red', 'white', 'rose', 'sparkling']),
  description: z.string(),
  pairingRationale: z.string(),
  flavorNotes: z.array(z.string()),
  flavorProfile: flavorProfileSchema,
  estimatedPriceMin: z.number(),
  estimatedPriceMax: z.number(),
  tastingOrder: z.number().int().positive(),
});

const foodToWinePlanResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  tastingTips: z.array(z.string()),
  totalEstimatedCostMin: z.number(),
  totalEstimatedCostMax: z.number(),
  wines: z.array(wineSchema),
});

const pairingSchema = z.object({
  dishName: z.string(),
  cuisineType: z.string().optional(),
  prepTimeBand: z.string().optional(),
  estimatedCostMin: z.number().optional(),
  estimatedCostMax: z.number().optional(),
  rationale: z.string(),
  dishAttributes: z.array(z.string()),
});

const wineToFoodPlanResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  pairings: z.array(pairingSchema).min(5).max(8),
  hostTips: z.array(z.string()),
  totalEstimatedCostMin: z.number(),
  totalEstimatedCostMax: z.number(),
});

export type FoodToWineGeneratedPlanResponse = z.infer<typeof foodToWinePlanResponseSchema>;
export type WineToFoodGeneratedPlanResponse = z.infer<typeof wineToFoodPlanResponseSchema>;
export type GeneratedPlanResponse = FoodToWineGeneratedPlanResponse | WineToFoodGeneratedPlanResponse;

async function sendToAnthropic(apiKey: string, system: string, userPrompt: string): Promise<unknown> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text?: string }> };
  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock || !textBlock.text) {
    throw new Error('No text response from AI');
  }

  const rawText = textBlock.text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  return JSON.parse(rawText);
}

async function generateFoodToWinePlan(
  input: FoodToWineTastingPlanInput,
  apiKey: string,
): Promise<FoodToWineGeneratedPlanResponse> {
  const parsed = await sendToAnthropic(
    apiKey,
    TASTING_PLAN_SYSTEM_PROMPT,
    buildTastingPlanUserPrompt(input),
  );
  return foodToWinePlanResponseSchema.parse(parsed);
}

async function generateWineToFoodPlan(
  input: WineToFoodTastingPlanInput,
  apiKey: string,
): Promise<WineToFoodGeneratedPlanResponse> {
  const parsed = await sendToAnthropic(
    apiKey,
    WINE_TO_FOOD_SYSTEM_PROMPT,
    buildWineToFoodUserPrompt(input),
  );
  return wineToFoodPlanResponseSchema.parse(parsed);
}

export async function generatePlan(
  input: TastingPlanInput,
  apiKey: string,
): Promise<GeneratedPlanResponse> {
  if (input.mode === 'wine_to_food') {
    return generateWineToFoodPlan(input, apiKey);
  }
  return generateFoodToWinePlan(input, apiKey);
}
