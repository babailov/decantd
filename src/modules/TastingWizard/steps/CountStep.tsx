'use client';

import { Minus, Plus, Wine } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/common/components/Button';
import { cn } from '@/common/functions/cn';
import { WINE_COUNT_MAX, WINE_COUNT_MIN } from '@/common/constants/wine.const';
import { useTastingStore } from '@/common/stores/useTastingStore';

export function CountStep() {
  const wineCount = useTastingStore((s) => s.wineCount);
  const setWineCount = useTastingStore((s) => s.setWineCount);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        How many wines?
      </h2>
      <p className="text-body-m text-text-secondary mb-l">
        We recommend 3–5 wines for a well-rounded tasting experience.
      </p>

      <div className="flex items-center justify-center gap-l mb-l">
        <button
          className={cn(
            'w-12 h-12 rounded-full border-2 border-border flex items-center justify-center transition-colors',
            wineCount <= WINE_COUNT_MIN
              ? 'opacity-30'
              : 'hover:border-primary active:bg-primary/5',
          )}
          disabled={wineCount <= WINE_COUNT_MIN}
          onClick={() => setWineCount(Math.max(WINE_COUNT_MIN, wineCount - 1))}
        >
          <Minus className="w-5 h-5 text-text-primary" />
        </button>

        <div className="flex flex-col items-center">
          <motion.span
            key={wineCount}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-heading-xl text-primary"
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {wineCount}
          </motion.span>
          <span className="text-body-xs text-text-muted">
            {wineCount === 1 ? 'wine' : 'wines'}
          </span>
        </div>

        <button
          className={cn(
            'w-12 h-12 rounded-full border-2 border-border flex items-center justify-center transition-colors',
            wineCount >= WINE_COUNT_MAX
              ? 'opacity-30'
              : 'hover:border-primary active:bg-primary/5',
          )}
          disabled={wineCount >= WINE_COUNT_MAX}
          onClick={() => setWineCount(Math.min(WINE_COUNT_MAX, wineCount + 1))}
        >
          <Plus className="w-5 h-5 text-text-primary" />
        </button>
      </div>

      {/* Wine glass visualization */}
      <div className="flex justify-center gap-2 mb-l">
        {Array.from({ length: WINE_COUNT_MAX }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i < wineCount ? 1 : 0.2, scale: i < wineCount ? 1 : 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Wine
              className={cn(
                'w-6 h-6 transition-colors',
                i < wineCount ? 'text-primary' : 'text-border',
              )}
            />
          </motion.div>
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
