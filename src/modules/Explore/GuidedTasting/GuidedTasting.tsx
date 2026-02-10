'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';

import { GuidedTastingProgress } from './GuidedTastingProgress';
import { LookStep } from './steps/LookStep';
import { SmellStep } from './steps/SmellStep';
import { TasteStep } from './steps/TasteStep';
import { ThinkStep } from './steps/ThinkStep';

const stepComponents: Record<string, React.ComponentType> = {
  look: LookStep,
  smell: SmellStep,
  taste: TasteStep,
  think: ThinkStep,
};

export function GuidedTasting() {
  const resetSession = useGuidedTastingStore((s) => s.resetSession);
  const currentStep = useGuidedTastingStore((s) => s.currentStep);
  const StepComponent = stepComponents[currentStep];

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  return (
    <div className="max-w-md mx-auto px-s py-m">
      <GuidedTastingProgress />

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
