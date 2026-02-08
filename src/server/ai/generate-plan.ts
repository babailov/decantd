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
  const userPrompt = buildTastingPlanUserPrompt(input);

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
      system: TASTING_PLAN_SYSTEM_PROMPT,
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

  // Strip markdown code fences if present (```json ... ```)
  const rawText = textBlock.text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(rawText);
  const validated = planResponseSchema.parse(parsed);

  return validated;
}
