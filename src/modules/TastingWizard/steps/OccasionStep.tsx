'use client';

import { motion } from 'motion/react';

import { cn } from '@/common/functions/cn';
import { OCCASIONS } from '@/common/constants/wine.const';
import { useTastingStore } from '@/common/stores/useTastingStore';
import { Occasion } from '@/common/types/wine';

export function OccasionStep() {
  const occasion = useTastingStore((s) => s.occasion);
  const setOccasion = useTastingStore((s) => s.setOccasion);
  const nextStep = useTastingStore((s) => s.nextStep);

  const handleSelect = (value: Occasion) => {
    setOccasion(value);
    nextStep();
  };

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        What&apos;s the occasion?
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        This helps us tailor the wine selection to your event.
      </p>

      <div className="grid grid-cols-2 gap-s">
        {OCCASIONS.map((item, i) => (
          <motion.button
            key={item.value}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'flex flex-col items-center text-center p-m rounded-2xl border-2 transition-colors',
              occasion === item.value
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface-elevated hover:border-primary/30',
            )}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => handleSelect(item.value)}
          >
            <span className="text-2xl mb-xs">{item.emoji}</span>
            <span className="font-display text-body-m font-semibold text-text-primary">
              {item.label}
            </span>
            <span className="text-body-xs text-text-muted mt-0.5">
              {item.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
