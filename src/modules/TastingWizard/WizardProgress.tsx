'use client';

import { Progress } from '@/common/components/Progress';
import { STEP_ORDER, useTastingStore } from '@/common/stores/useTastingStore';

const STEP_LABELS: Record<string, string> = {
  occasion: 'Chapter 1: Occasion',
  food: 'Chapter 2: Table',
  preferences: 'Chapter 3: Style',
  budget: 'Chapter 4: Budget',
  count: 'Chapter 5: Lineup',
  review: 'Chapter 6: Final Pour',
};

export function WizardProgress() {
  const currentStep = useTastingStore((s) => s.currentStep);
  const idx = STEP_ORDER.indexOf(currentStep);
  const progress = ((idx + 1) / STEP_ORDER.length) * 100;

  return (
    <div className="mb-l">
      <div className="flex justify-between items-center mb-xs">
        <span className="text-body-xs text-text-muted">
          Stop {idx + 1} of {STEP_ORDER.length}
        </span>
        <span className="text-body-xs font-medium text-primary">
          {STEP_LABELS[currentStep]}
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
