'use client';

import { Progress } from '@/common/components/Progress';
import { getStepOrder, useTastingStore } from '@/common/stores/useTastingStore';

const FOOD_TO_WINE_STEP_LABELS: Record<string, string> = {
  occasion: 'Chapter 1: Occasion',
  food: 'Chapter 2: Table',
  preferences: 'Chapter 3: Style',
  budget: 'Chapter 4: Budget',
  count: 'Chapter 5: Lineup',
  review: 'Chapter 6: Final Pour',
};

const WINE_TO_FOOD_STEP_LABELS: Record<string, string> = {
  wine: 'Chapter 1: Wine',
  occasion: 'Chapter 2: Occasion',
  refinements: 'Chapter 3: Filters',
  cuisines: 'Chapter 4: Cuisine',
  context: 'Chapter 5: Hosting',
  review: 'Chapter 6: Final Plate',
};

export function WizardProgress() {
  const mode = useTastingStore((s) => s.mode);
  const currentStep = useTastingStore((s) => s.currentStep);
  const stepOrder = getStepOrder(mode);
  const stepLabels = mode === 'wine_to_food' ? WINE_TO_FOOD_STEP_LABELS : FOOD_TO_WINE_STEP_LABELS;
  const idx = stepOrder.indexOf(currentStep);
  const progress = ((idx + 1) / stepOrder.length) * 100;

  return (
    <div className="mb-l">
      <div className="flex justify-between items-center mb-xs">
        <span className="text-body-xs text-text-muted">
          Stop {idx + 1} of {stepOrder.length}
        </span>
        <span className="text-body-xs font-medium text-primary">
          {stepLabels[currentStep]}
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
