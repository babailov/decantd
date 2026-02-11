'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

import { useTierConfig } from '@/common/hooks/useTierConfig';
import { trackEvent } from '@/common/services/analytics-api';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { useTastingStore } from '@/common/stores/useTastingStore';

import { GuestPlansList } from '@/modules/Landing/GuestPlansList';

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
  const setSurpriseMe = useTastingStore((s) => s.setSurpriseMe);
  const setBudgetRange = useTastingStore((s) => s.setBudgetRange);
  const setWineCount = useTastingStore((s) => s.setWineCount);
  const { isAuthenticated } = useAuthStore();
  const tierConfig = useTierConfig();

  useEffect(() => {
    resetWizard();
    trackEvent('plan_wizard_started', { source: 'tasting_new' });
  }, [resetWizard]);

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
    <div className="vineyard-page max-w-md mx-auto px-s py-m">
      {!isAuthenticated() && <GuestPlansList compact />}

      <div className="mb-m rounded-2xl border border-white/60 bg-white/55 p-s backdrop-blur-sm">
        <p className="font-display text-body-m text-primary">Build your tasting story</p>
        <p className="text-body-s text-text-secondary">
          We will guide you through six quick stops to craft a balanced wine lineup.
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
