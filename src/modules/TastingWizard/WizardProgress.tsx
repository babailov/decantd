'use client';

import { Progress } from '@/common/components/Progress';
import { cn } from '@/common/functions/cn';
import { STEP_ORDER, useTastingStore } from '@/common/stores/useTastingStore';

const STEP_LABELS: Record<string, string> = {
  occasion: 'Occasion',
  food: 'Food Pairing',
  preferences: 'Preferences',
  budget: 'Budget',
  count: 'Wine Count',
  review: 'Review',
};

export function WizardProgress() {
  const currentStep = useTastingStore((s) => s.currentStep);
  const idx = STEP_ORDER.indexOf(currentStep);
  const progress = ((idx + 1) / STEP_ORDER.length) * 100;

  return (
    <div className="mb-l">
      <div className="flex justify-between items-center mb-xs">
        <span className="text-body-xs text-text-muted">
          Step {idx + 1} of {STEP_ORDER.length}
        </span>
        <span className="text-body-xs font-medium text-primary">
          {STEP_LABELS[currentStep]}
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
