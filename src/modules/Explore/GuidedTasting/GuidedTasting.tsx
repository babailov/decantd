'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useGuidedTasting } from '@/common/hooks/services/useGuidedTastings';
import { trackEvent } from '@/common/services/analytics-api';
import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';

import { GuidedTastingProgress } from './GuidedTastingProgress';
import { LookStep } from './steps/LookStep';
import { SmellStep } from './steps/SmellStep';
import { TasteStep } from './steps/TasteStep';
import { TastingSummary } from './steps/TastingSummary';
import { ThinkStep } from './steps/ThinkStep';

const stepComponents: Record<string, React.ComponentType> = {
  look: LookStep,
  smell: SmellStep,
  taste: TasteStep,
  think: ThinkStep,
  summary: TastingSummary,
};

export function GuidedTasting() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const resetSession = useGuidedTastingStore((s) => s.resetSession);
  const hydrateFromSaved = useGuidedTastingStore((s) => s.hydrateFromSaved);
  const currentStep = useGuidedTastingStore((s) => s.currentStep);
  const StepComponent = stepComponents[currentStep];

  const { data: savedTasting } = useGuidedTasting(idParam);
  const hydratedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (idParam && savedTasting && !hydratedRef.current) {
      // Loading a saved tasting — hydrate the store
      hydrateFromSaved(savedTasting);
      hydratedRef.current = true;
    } else if (!idParam) {
      // No id param — always start fresh
      resetSession();
    }
  }, [idParam, savedTasting, hydrateFromSaved, resetSession]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent('guided_tasting_started', {
        mode: idParam ? 'resume' : 'new',
      });
    }
  }, [idParam]);

  return (
    <div className="max-w-md mx-auto px-s py-m">
      {currentStep !== 'summary' && <GuidedTastingProgress />}

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
