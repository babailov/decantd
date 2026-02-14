'use client';

import { motion } from 'motion/react';

import { Button } from '@/common/components/Button';
import { Input } from '@/common/components/Input';
import { cn } from '@/common/functions/cn';
import { useTastingStore } from '@/common/stores/useTastingStore';

import { WINE_STYLE_SUGGESTIONS } from '../constants';

export function WineStep() {
  const wineInputType = useTastingStore((s) => s.wineInputType);
  const setWineInputType = useTastingStore((s) => s.setWineInputType);
  const wineInputValue = useTastingStore((s) => s.wineInputValue);
  const setWineInputValue = useTastingStore((s) => s.setWineInputValue);
  const nextStep = useTastingStore((s) => s.nextStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Which wine are you pouring?
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Pick a wine style or enter a specific bottle and we&apos;ll build a food game plan around it.
      </p>

      <div className="grid grid-cols-2 gap-s mb-m">
        <button
          className={cn(
            'rounded-xl border-2 px-s py-xs text-body-s font-medium transition-colors',
            wineInputType === 'style'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface-elevated text-text-secondary',
          )}
          onClick={() => setWineInputType('style')}
        >
          Wine style
        </button>
        <button
          className={cn(
            'rounded-xl border-2 px-s py-xs text-body-s font-medium transition-colors',
            wineInputType === 'specific'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface-elevated text-text-secondary',
          )}
          onClick={() => setWineInputType('specific')}
        >
          Specific bottle
        </button>
      </div>

      {wineInputType === 'specific' && (
        <Input
          id="wine-input-specific"
          placeholder="e.g., Louis Jadot Bourgogne Pinot Noir 2021"
          value={wineInputValue}
          onChange={(e) => setWineInputValue(e.target.value)}
        />
      )}

      {wineInputType === 'style' && (
        <div className="flex flex-wrap gap-2">
          {WINE_STYLE_SUGGESTIONS.map((suggestion, i) => (
            <motion.button
              key={suggestion}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'text-body-xs px-s py-1.5 rounded-full border transition-colors',
                wineInputValue === suggestion
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-secondary hover:border-primary/30',
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              onClick={() => setWineInputValue(suggestion)}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex gap-s mt-l">
        <Button
          className="flex-1"
          disabled={!wineInputValue.trim()}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
