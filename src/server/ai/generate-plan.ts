import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { TastingPlanInput } from '@/common/types/tasting';

import {
  buildTastingPlanUserPrompt,
  TASTING_PLAN_SYSTEM_PROMPT,
} from './prompts/tasting-plan';

const flavorProfileSchema = z.object({
  acidity: z.number().min(0).max(5),
  tannin: z.number().min(0).max(5),
  sweetness: z.number().min(0).max(5),
  alcohol: z.number().min(0).max(5),
  body: z.number().min(0).max(5),
});

const wineSchema = z.object({
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

const planResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  tastingTips: z.array(z.string()),
  totalEstimatedCostMin: z.number(),
  totalEstimatedCostMax: z.number(),
  wines: z.array(wineSchema),
});

export type GeneratedPlanResponse = z.infer<typeof planResponseSchema>;

export async function generatePlan(
  input: TastingPlanInput,
  apiKey: string,
): Promise<GeneratedPlanResponse> {
  const client = new Anthropic({ apiKey });

  const userPrompt = buildTastingPlanUserPrompt(input);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: TASTING_PLAN_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  // Strip markdown code fences if present (```json ... ```)
  const rawText = textBlock.text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(rawText);
  const validated = planResponseSchema.parse(parsed);

  return validated;
}
