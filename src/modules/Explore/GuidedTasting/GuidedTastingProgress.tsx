'use client';

import { Brain, Eye, Wine, Wind } from 'lucide-react';

import { cn } from '@/common/functions/cn';
import {
  GUIDED_STEP_ORDER,
  useGuidedTastingStore,
} from '@/common/stores/useGuidedTastingStore';

const STEP_ICONS = {
  look: Eye,
  smell: Wind,
  taste: Wine,
  think: Brain,
};

const STEP_LABELS = {
  look: 'Look',
  smell: 'Smell',
  taste: 'Taste',
  think: 'Think',
};

export function GuidedTastingProgress() {
  const currentStep = useGuidedTastingStore((s) => s.currentStep);
  const currentIdx = GUIDED_STEP_ORDER.indexOf(currentStep);

  return (
    <div className="mb-l">
      <div className="flex items-center justify-between">
        {GUIDED_STEP_ORDER.map((step, i) => {
          const Icon = STEP_ICONS[step];
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;

          return (
            <div key={step} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                  isActive && 'bg-primary text-text-on-primary scale-110',
                  isDone && 'bg-primary/20 text-primary',
                  !isActive && !isDone && 'bg-surface text-text-muted border border-border',
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  'text-body-xs',
                  isActive ? 'text-primary font-medium' : 'text-text-muted',
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress line */}
      <div className="flex gap-1 mt-xs px-5">
        {GUIDED_STEP_ORDER.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-0.5 rounded-full transition-all',
              i < currentIdx ? 'bg-primary' : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}
