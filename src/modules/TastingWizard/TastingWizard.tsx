'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

import { cn } from '@/common/functions/cn';
import { useTierConfig } from '@/common/hooks/useTierConfig';
import { trackEvent } from '@/common/services/analytics-api';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { useTastingStore } from '@/common/stores/useTastingStore';

import { GuestPlansList } from '@/modules/Landing/GuestPlansList';

import { BudgetStep } from './steps/BudgetStep';
import { ContextStep } from './steps/ContextStep';
import { CountStep } from './steps/CountStep';
import { CuisineStep } from './steps/CuisineStep';
import { FoodStep } from './steps/FoodStep';
import { OccasionStep } from './steps/OccasionStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { RefinementsStep } from './steps/RefinementsStep';
import { ReviewStep } from './steps/ReviewStep';
import { WineStep } from './steps/WineStep';
import { WizardProgress } from './WizardProgress';

const stepComponents: Record<string, React.ComponentType> = {
  wine: WineStep,
  occasion: OccasionStep,
  food: FoodStep,
  preferences: PreferencesStep,
  budget: BudgetStep,
  count: CountStep,
  refinements: RefinementsStep,
  cuisines: CuisineStep,
  context: ContextStep,
  review: ReviewStep,
};

export function TastingWizard() {
  const resetWizard = useTastingStore((s) => s.resetWizard);
  const mode = useTastingStore((s) => s.mode);
  const setMode = useTastingStore((s) => s.setMode);
  const setSurpriseMe = useTastingStore((s) => s.setSurpriseMe);
  const setBudgetRange = useTastingStore((s) => s.setBudgetRange);
  const setWineCount = useTastingStore((s) => s.setWineCount);
  const { isAuthenticated } = useAuthStore();
  const tierConfig = useTierConfig();

  useEffect(() => {
    resetWizard();
    trackEvent('plan_wizard_started', { source: 'tasting_new' });
  }, [resetWizard]);

  useEffect(() => {
    if (mode === 'wine_to_food') {
      trackEvent('reverse_pairing_started', { source: 'tasting_new' });
    }
  }, [mode]);

  // Enforce tier defaults for anonymous users
  useEffect(() => {
    if (tierConfig.forceSurpriseMe) {
      setSurpriseMe(true);
    }
    if (tierConfig.fixedWineCount !== null) {
      setWineCount(tierConfig.fixedWineCount);
    }
    if (tierConfig.budgetPresets.length === 1) {
      const preset = tierConfig.budgetPresets[0];
      setBudgetRange(preset.min, preset.max);
    }
  }, [tierConfig, setSurpriseMe, setBudgetRange, setWineCount]);

  const currentStep = useTastingStore((s) => s.currentStep);
  const StepComponent = stepComponents[currentStep];

  return (
    <div className="max-w-md mx-auto px-s py-m">
      {!isAuthenticated() && <GuestPlansList compact />}

      <div className="mb-m rounded-2xl border border-border bg-surface-elevated p-s">
        <div className="mb-s grid grid-cols-2 gap-2 rounded-xl bg-surface p-1">
          <button
            className={cn(
              'rounded-lg px-s py-1.5 text-body-xs font-medium transition-colors',
              mode === 'food_to_wine'
                ? 'bg-primary text-text-on-primary'
                : 'text-text-secondary',
            )}
            onClick={() => setMode('food_to_wine')}
          >
            Food -&gt; Wine
          </button>
          <button
            className={cn(
              'rounded-lg px-s py-1.5 text-body-xs font-medium transition-colors',
              mode === 'wine_to_food'
                ? 'bg-primary text-text-on-primary'
                : 'text-text-secondary',
            )}
            onClick={() => setMode('wine_to_food')}
          >
            Wine -&gt; Food
          </button>
        </div>
        <p className="font-display text-body-m text-primary">Build your tasting story</p>
        <p className="text-body-s text-text-secondary">
          {mode === 'food_to_wine'
            ? 'We will guide you through six quick stops to craft a balanced wine lineup.'
            : 'Start with your bottle, then we will map food pairings that fit your table.'}
        </p>
      </div>

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
