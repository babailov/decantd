'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

import { useTastingStore } from '@/common/stores/useTastingStore';

import { BudgetStep } from './steps/BudgetStep';
import { CountStep } from './steps/CountStep';
import { FoodStep } from './steps/FoodStep';
import { OccasionStep } from './steps/OccasionStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { ReviewStep } from './steps/ReviewStep';
import { WizardProgress } from './WizardProgress';

const stepComponents: Record<string, React.ComponentType> = {
  occasion: OccasionStep,
  food: FoodStep,
  preferences: PreferencesStep,
  budget: BudgetStep,
  count: CountStep,
  review: ReviewStep,
};

export function TastingWizard() {
  const resetWizard = useTastingStore((s) => s.resetWizard);

  useEffect(() => {
    resetWizard();
  }, [resetWizard]);

  const currentStep = useTastingStore((s) => s.currentStep);
  const StepComponent = stepComponents[currentStep];

  return (
    <div className="max-w-md mx-auto px-s py-m">
      <WizardProgress />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          initial={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
