'use client';

import { Check, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/common/components/Button';
import {
  CLARITY_OPTIONS,
  COLOR_DEPTH_OPTIONS,
  VISCOSITY_EDUCATION,
  WINE_TYPE_OPTIONS,
} from '@/common/constants/tasting-guide.const';
import { cn } from '@/common/functions/cn';
import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';

export function LookStep() {
  const wineType = useGuidedTastingStore((s) => s.wineType);
  const setWineType = useGuidedTastingStore((s) => s.setWineType);
  const colorDepth = useGuidedTastingStore((s) => s.colorDepth);
  const setColorDepth = useGuidedTastingStore((s) => s.setColorDepth);
  const clarity = useGuidedTastingStore((s) => s.clarity);
  const setClarity = useGuidedTastingStore((s) => s.setClarity);
  const viscosityNoted = useGuidedTastingStore((s) => s.viscosityNoted);
  const setViscosityNoted = useGuidedTastingStore((s) => s.setViscosityNoted);
  const nextStep = useGuidedTastingStore((s) => s.nextStep);

  const colorOptions = wineType ? COLOR_DEPTH_OPTIONS[wineType] : null;

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Look at Your Wine
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Hold your glass against a white background. Tilt it slightly and observe.
      </p>

      {/* Wine type selector */}
      <div className="mb-m">
        <h3 className="text-body-s font-medium text-text-primary mb-xs">
          What type of wine?
        </h3>
        <div className="grid grid-cols-4 gap-xs">
          {WINE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={cn(
                'flex flex-col items-center gap-1 p-xs rounded-xl border-2 transition-colors',
                wineType === opt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface-elevated hover:border-primary/30',
              )}
              onClick={() => setWineType(opt.value)}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-body-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color depth */}
      {colorOptions && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-m"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-body-s font-medium text-text-primary mb-xs">
            Color Depth
          </h3>
          <div className="flex flex-col gap-xs">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  'flex items-center gap-s p-s rounded-xl border-2 transition-colors text-left',
                  colorDepth === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface-elevated hover:border-primary/30',
                )}
                onClick={() => setColorDepth(opt.value)}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg bg-gradient-to-br flex-shrink-0',
                    opt.gradient,
                  )}
                />
                <div>
                  <span className="text-body-s font-medium text-text-primary block">
                    {opt.label}
                  </span>
                  <span className="text-body-xs text-text-muted">
                    {opt.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Clarity */}
      {wineType && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-m"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <h3 className="text-body-s font-medium text-text-primary mb-xs">
            Clarity
          </h3>
          <div className="flex flex-col gap-xs">
            {CLARITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  'p-s rounded-xl border-2 transition-colors text-left',
                  clarity === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface-elevated hover:border-primary/30',
                )}
                onClick={() => setClarity(opt.value)}
              >
                <span className="text-body-s font-medium text-text-primary block">
                  {opt.label}
                </span>
                <span className="text-body-xs text-text-muted">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Viscosity education */}
      {wineType && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-m"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div
            className={cn(
              'p-m rounded-xl border-2 transition-colors',
              viscosityNoted
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-surface-elevated',
            )}
          >
            <h3 className="text-body-s font-medium text-text-primary mb-xs">
              {VISCOSITY_EDUCATION.title}
            </h3>
            <p className="text-body-xs text-text-secondary mb-s">
              {VISCOSITY_EDUCATION.description}
            </p>
            <button
              className={cn(
                'flex items-center gap-xs text-body-s font-medium transition-colors',
                viscosityNoted ? 'text-primary' : 'text-text-muted',
              )}
              onClick={() => setViscosityNoted(!viscosityNoted)}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  viscosityNoted
                    ? 'border-primary bg-primary'
                    : 'border-border',
                )}
              >
                {viscosityNoted && <Check className="w-3 h-3 text-text-on-primary" />}
              </div>
              Got it!
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-s mt-l">
        <Link className="flex-1" href="/explore">
          <Button className="w-full" variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <Button
          className="flex-1"
          disabled={!wineType}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
