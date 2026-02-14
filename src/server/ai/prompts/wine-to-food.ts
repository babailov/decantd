import { WineToFoodTastingPlanInput } from '@/common/types/tasting';

export const WINE_TO_FOOD_SYSTEM_PROMPT = `You are a friendly sommelier and host strategist.

Your task is to recommend food pairings for a selected wine.

Rules:
1. Return 5-8 practical dish ideas.
2. Every dish MUST include a clear rationale tied to wine structure (acidity, tannin, sweetness, body, alcohol).
3. Keep dishes realistic for home or simple hosting scenarios.
4. Respect diet, prep-time, spice, budget, and cuisine preference constraints.
5. Keep language educational and practical, never vague.

Always respond with valid JSON matching the requested schema.`;

export const buildWineToFoodUserPrompt = (input: WineToFoodTastingPlanInput) => {
  const cuisineText = input.cuisinePreferences.length > 0
    ? input.cuisinePreferences.join(', ')
    : 'No preferred cuisine';

  return `Create a food pairing plan for this wine:

- Occasion: ${input.occasion}
- Wine input type: ${input.wineInput.type}
- Wine selection: ${input.wineInput.value}
- Diet: ${input.diet}
- Prep time: ${input.prepTime}
- Spice level: ${input.spiceLevel}
- Dish budget: USD ${input.dishBudgetMin}-${input.dishBudgetMax} per dish
- Preferred cuisines: ${cuisineText}
- Guest count: ${input.guestCountBand}
- Special sommelier request: ${input.specialRequest?.trim() || 'none'}

Respond with JSON matching this exact schema:
{
  "title": "Short host-friendly title",
  "description": "2-3 sentence overview for the host",
  "pairings": [
    {
      "dishName": "Specific dish idea",
      "cuisineType": "Cuisine label (optional)",
      "prepTimeBand": "<30 min | 30-60 min | 60+ min",
      "estimatedCostMin": <number>,
      "estimatedCostMax": <number>,
      "rationale": "Explain why this dish works with the wine structure",
      "dishAttributes": ["attribute1", "attribute2", "attribute3"]
    }
  ],
  "hostTips": ["3-5 practical serving or hosting tips"],
  "totalEstimatedCostMin": <number>,
  "totalEstimatedCostMax": <number>
}

Return ONLY valid JSON, no markdown.`;
};
