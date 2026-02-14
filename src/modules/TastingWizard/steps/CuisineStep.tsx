'use client';

import { motion } from 'motion/react';

import { Button } from '@/common/components/Button';
import { cn } from '@/common/functions/cn';
import { useTastingStore } from '@/common/stores/useTastingStore';

import { CUISINE_OPTIONS } from '../constants';

export function CuisineStep() {
  const cuisinePreferences = useTastingStore((s) => s.cuisinePreferences);
  const toggleCuisinePreference = useTastingStore((s) => s.toggleCuisinePreference);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Any cuisine direction?
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Optional. Pick cuisines you want prioritized.
      </p>

      <div className="flex flex-wrap gap-2">
        {CUISINE_OPTIONS.map((option, i) => (
          <motion.button
            key={option}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'text-body-xs px-s py-1.5 rounded-full border transition-colors',
              cuisinePreferences.includes(option)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-elevated text-text-secondary hover:border-primary/30',
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            onClick={() => toggleCuisinePreference(option)}
          >
            {option}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-s mt-l">
        <Button className="flex-1" variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button className="flex-1" onClick={nextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
}
