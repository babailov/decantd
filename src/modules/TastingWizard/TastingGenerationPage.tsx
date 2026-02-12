'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/common/components/Button';
import { useTastingGenerationToastStore } from '@/common/stores/useTastingGenerationToastStore';

const CELLAR_ACTIONS = [
  { verb: 'Pruning vines', detail: 'Trimming your preferences into a sharper tasting lineup.' },
  { verb: 'Clipping clusters', detail: 'Removing noise so every pour has a purpose.' },
  { verb: 'Harvesting ideas', detail: 'Collecting bottles that fit your night and budget.' },
  { verb: 'Crushing notes', detail: 'Pressing aromas, structure, and pairing logic together.' },
  { verb: 'Barrel resting', detail: 'Letting the final sequence settle from light to bold.' },
  { verb: 'Bottling your plan', detail: 'Sealing your tasting story for the table.' },
] as const;

const ACTION_INTERVAL_MS = 1700;

export function TastingGenerationPage() {
  const status = useTastingGenerationToastStore((s) => s.status);
  const planId = useTastingGenerationToastStore((s) => s.planId);
  const clearGeneration = useTastingGenerationToastStore((s) => s.clearGeneration);

  const [actionIndex, setActionIndex] = useState(0);

  useEffect(() => {
    if (status !== 'loading') {
      return;
    }

    const interval = window.setInterval(() => {
      setActionIndex((prev) => (prev + 1) % CELLAR_ACTIONS.length);
    }, ACTION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [status]);

  const action = useMemo(() => CELLAR_ACTIONS[actionIndex], [actionIndex]);

  const isLoading = status === 'loading';
  const isReady = status === 'success' && Boolean(planId);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-s py-l">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-border bg-surface-elevated p-l shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-m flex items-center gap-s">
          <div className="relative h-12 w-12 rounded-full bg-primary/15">
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute inset-1 rounded-full border-2 border-primary/25 border-t-primary"
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div>
            <p className="font-display text-heading-s text-primary">Cellar in progress</p>
            <p className="text-body-s text-text-secondary">We are crafting your tasting journey.</p>
          </div>
        </div>

        {isLoading && (
          <>
            <div className="mb-s h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                className="h-full w-1/3 rounded-full bg-primary"
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={action.verb}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="text-body-l font-semibold text-text-primary">{action.verb}</p>
                <p className="text-body-s text-text-secondary">{action.detail}</p>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {isReady && planId && (
          <div className="space-y-s">
            <p className="text-body-l font-semibold text-text-primary">Your tasting is ready.</p>
            <p className="text-body-s text-text-secondary">
              Your lineup is sealed. Open it now and start pouring from light to bold.
            </p>
            <Link href={`/tasting/${planId}`}>
              <Button className="w-full" onClick={() => clearGeneration()}>
                Open tasting
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && !isReady && (
          <div className="space-y-s">
            <p className="text-body-m font-medium text-text-primary">No active generation.</p>
            <p className="text-body-s text-text-secondary">
              Start a new tasting plan and we will bring you back here while the cellar works.
            </p>
            <Link href="/tasting/new">
              <Button className="w-full" variant="outline">
                Start a new tasting
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
