'use client';

import { Shuffle } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/common/components/Button';
import { POPULAR_REGIONS } from '@/common/constants/wine.const';
import { cn } from '@/common/functions/cn';
import { useTastingStore } from '@/common/stores/useTastingStore';

export function PreferencesStep() {
  const regionPreferences = useTastingStore((s) => s.regionPreferences);
  const toggleRegion = useTastingStore((s) => s.toggleRegion);
  const surpriseMe = useTastingStore((s) => s.surpriseMe);
  const setSurpriseMe = useTastingStore((s) => s.setSurpriseMe);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Any region preferences?
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Select your favorite wine regions, or let us surprise you.
      </p>

      <button
        className={cn(
          'flex items-center gap-xs w-full p-s rounded-xl border-2 mb-m transition-colors',
          surpriseMe
            ? 'border-accent bg-accent/10'
            : 'border-border bg-surface-elevated hover:border-accent/30',
        )}
        onClick={() => setSurpriseMe(!surpriseMe)}
      >
        <Shuffle className="w-5 h-5 text-accent" />
        <div className="text-left">
          <span className="font-medium text-body-m text-text-primary block">
            Surprise me!
          </span>
          <span className="text-body-xs text-text-muted">
            Let our AI pick the best regions for your occasion
          </span>
        </div>
      </button>

      {!surpriseMe && (
        <div className="flex flex-wrap gap-2">
          {POPULAR_REGIONS.map((region, i) => (
            <motion.button
              key={region.value}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center gap-1.5 text-body-s px-s py-1.5 rounded-full border transition-colors',
                regionPreferences.includes(region.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-secondary hover:border-primary/30',
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              onClick={() => toggleRegion(region.value)}
            >
              <span>{region.flag}</span>
              {region.label}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex gap-s mt-l">
        <Button className="flex-1" variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!surpriseMe && regionPreferences.length === 0}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
