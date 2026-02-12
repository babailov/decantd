'use client';

import { motion } from 'motion/react';
import { useEffect } from 'react';

import { Button } from '@/common/components/Button';
import { Slider } from '@/common/components/Slider';
import { UpgradeCTA } from '@/common/components/UpgradeCTA';
import { cn } from '@/common/functions/cn';
import { useTierConfig } from '@/common/hooks/useTierConfig';
import { useTastingStore } from '@/common/stores/useTastingStore';

export function BudgetStep() {
  const budgetMin = useTastingStore((s) => s.budgetMin);
  const budgetMax = useTastingStore((s) => s.budgetMax);
  const setBudgetRange = useTastingStore((s) => s.setBudgetRange);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);
  const tierConfig = useTierConfig();

  // Auto-select single preset for anonymous users
  useEffect(() => {
    if (tierConfig.budgetPresets.length === 1) {
      const preset = tierConfig.budgetPresets[0];
      setBudgetRange(preset.min, preset.max);
    }
  }, [tierConfig.budgetPresets, setBudgetRange]);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Choose your comfort range
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Per-bottle budget (USD) so recommendations stay realistic.
      </p>

      {/* Quick presets */}
      <div className="flex gap-2 mb-l">
        {tierConfig.budgetPresets.map((preset, i) => (
          <motion.button
            key={preset.label}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'flex-1 text-body-s font-medium py-xs rounded-xl border-2 transition-colors',
              budgetMin === preset.min && budgetMax === preset.max
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-elevated text-text-secondary hover:border-primary/30',
            )}
            initial={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            onClick={() => setBudgetRange(preset.min, preset.max)}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      {/* Dual-thumb slider — only for users with custom budget access */}
      {tierConfig.allowCustomBudget && (
        <div className="px-xs">
          <Slider
            max={200}
            min={5}
            step={5}
            value={[budgetMin, budgetMax]}
            onValueChange={([min, max]) => setBudgetRange(min, max)}
          />
          <div className="flex justify-between mt-xs">
            <span className="text-body-m font-semibold text-primary">
              ${budgetMin}
            </span>
            <span className="text-body-m font-semibold text-primary">
              ${budgetMax}
            </span>
          </div>
        </div>
      )}

      {!tierConfig.allowCustomBudget && (
        <UpgradeCTA message="Sign up for more budget options." />
      )}

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
