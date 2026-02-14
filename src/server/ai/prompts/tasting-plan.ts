import { FoodToWineTastingPlanInput } from '@/common/types/tasting';

export const TASTING_PLAN_SYSTEM_PROMPT = `You are a friendly, knowledgeable sommelier AI — think Wine Folly meets your fun wine-loving friend. Your job is to create personalized wine tasting plans that are educational, approachable, and exciting.

When creating a tasting plan, you should:
1. Select real grape varietals and real wine regions (no made-up wines)
2. Recommend SPECIFIC, searchable wine names (e.g., "Louis Jadot Bourgogne Pinot Noir 2021", not just "a Pinot Noir from Burgundy") — include producer, wine name, and vintage year
3. Order wines from lightest to boldest for optimal tasting progression
4. Consider the food pairing, occasion, and budget when selecting wines
5. Provide flavor profiles on a 0-5 scale (acidity, tannin, sweetness, alcohol, body)
6. Include specific, helpful tasting notes and pairing rationales
7. Keep descriptions engaging and educational, not pretentious
8. Suggest accessible wines that can be found at good wine shops or ordered online

Your tone should be warm, enthusiastic, and educational. Use vivid flavor descriptions. Make wine fun and approachable, not intimidating.

Always respond with valid JSON matching the requested schema.`;

export const buildTastingPlanUserPrompt = (input: FoodToWineTastingPlanInput) => {
  const regionText =
    input.regionPreferences.length > 0
      ? `Preferred regions: ${input.regionPreferences.join(', ')}`
      : 'No region preference — surprise me with a diverse global selection';

  const specialRequestText = input.specialRequest?.trim()
    ? `- Special sommelier request: ${input.specialRequest.trim()}`
    : '- Special sommelier request: none';

  return `Create a wine tasting plan with these details:

- Occasion: ${input.occasion}
- Food pairing: ${input.foodPairing}
- ${regionText}
- Budget: ${input.budgetCurrency} ${input.budgetMin}–${input.budgetMax} per bottle
- Number of wines: ${input.wineCount}
${specialRequestText}

Respond with JSON matching this exact schema:
{
  "title": "A short, catchy title for this tasting plan",
  "description": "A 2-3 sentence narrative overview of the tasting experience",
  "tastingTips": ["3-5 helpful tips for this specific tasting"],
  "totalEstimatedCostMin": <number>,
  "totalEstimatedCostMax": <number>,
  "wines": [
    {
      "wineName": "Full specific wine name (Producer + Wine + Vintage), e.g. 'Louis Jadot Bourgogne Pinot Noir 2021'",
      "varietal": "Grape varietal name",
      "region": "Country or major region",
      "subRegion": "Specific sub-region (optional)",
      "yearRange": "e.g. 2019-2022",
      "wineType": "red" | "white" | "rose" | "sparkling",
      "description": "2-3 sentences about this wine style",
      "pairingRationale": "Why this wine works with the food/occasion",
      "flavorNotes": ["note1", "note2", "note3", "note4"],
      "flavorProfile": {
        "acidity": <0-5>,
        "tannin": <0-5>,
        "sweetness": <0-5>,
        "alcohol": <0-5>,
        "body": <0-5>
      },
      "estimatedPriceMin": <number>,
      "estimatedPriceMax": <number>,
      "tastingOrder": <1-based order>
    }
  ]
}

Order wines from lightest to boldest. Ensure each wine fits within the budget range. Return ONLY valid JSON, no markdown.`;
};
