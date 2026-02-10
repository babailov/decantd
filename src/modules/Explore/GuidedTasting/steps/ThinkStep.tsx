'use client';

import { PartyPopper, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/common/components/Button';
import { FlavorRadar } from '@/common/components/FlavorRadar';
import { findAromaById } from '@/common/constants/aroma-wheel.const';
import { FINISH_LENGTH_OPTIONS } from '@/common/constants/tasting-guide.const';
import { cn } from '@/common/functions/cn';
import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';

export function ThinkStep() {
  const balance = useGuidedTastingStore((s) => s.balance);
  const setBalance = useGuidedTastingStore((s) => s.setBalance);
  const complexity = useGuidedTastingStore((s) => s.complexity);
  const setComplexity = useGuidedTastingStore((s) => s.setComplexity);
  const finishLength = useGuidedTastingStore((s) => s.finishLength);
  const setFinishLength = useGuidedTastingStore((s) => s.setFinishLength);
  const wouldDrinkAgain = useGuidedTastingStore((s) => s.wouldDrinkAgain);
  const setWouldDrinkAgain = useGuidedTastingStore((s) => s.setWouldDrinkAgain);
  const notes = useGuidedTastingStore((s) => s.notes);
  const setNotes = useGuidedTastingStore((s) => s.setNotes);
  const prevStep = useGuidedTastingStore((s) => s.prevStep);
  const resetSession = useGuidedTastingStore((s) => s.resetSession);

  // Summary data
  const wineType = useGuidedTastingStore((s) => s.wineType);
  const selectedAromas = useGuidedTastingStore((s) => s.selectedAromas);
  const acidity = useGuidedTastingStore((s) => s.acidity);
  const tannin = useGuidedTastingStore((s) => s.tannin);
  const sweetness = useGuidedTastingStore((s) => s.sweetness);
  const alcohol = useGuidedTastingStore((s) => s.alcohol);
  const body = useGuidedTastingStore((s) => s.body);

  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
  };

  const handleNewTasting = () => {
    resetSession();
    setCompleted(false);
  };

  if (completed) {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-l"
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          animate={{ rotate: 0, scale: 1 }}
          initial={{ rotate: -15, scale: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
        >
          <PartyPopper className="w-16 h-16 text-primary mx-auto mb-m" />
        </motion.div>
        <h2 className="font-display text-heading-m text-primary mb-xs">
          Tasting Complete!
        </h2>
        <p className="text-body-m text-text-secondary mb-l">
          Nice work! The more you taste mindfully, the faster your palate develops.
        </p>

        {/* Summary card */}
        <div className="text-left p-m rounded-xl border border-border bg-surface-elevated mb-m">
          <h3 className="text-body-s font-medium text-text-primary mb-s">
            Your Tasting Notes
          </h3>
          <FlavorRadar
            className="h-48 mb-s"
            data={{ acidity, tannin, sweetness, alcohol, body }}
            wineType={wineType ?? 'red'}
          />
          {selectedAromas.length > 0 && (
            <div className="mb-s">
              <span className="text-body-xs text-text-muted block mb-1">Aromas detected:</span>
              <div className="flex flex-wrap gap-1">
                {selectedAromas.map((id) => {
                  const aroma = findAromaById(id);
                  return (
                    <span
                      key={id}
                      className="text-body-xs px-xs py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {aroma?.label ?? id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {notes && (
            <div>
              <span className="text-body-xs text-text-muted block mb-1">Notes:</span>
              <p className="text-body-s text-text-primary">{notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-xs">
          <Button className="w-full" onClick={handleNewTasting}>
            Start New Tasting
          </Button>
          <Link href="/explore">
            <Button className="w-full" variant="ghost">
              Back to Explore
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Think About It
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Step back and consider the wine as a whole. How does it all come together?
      </p>

      {/* Balance */}
      <div className="mb-m">
        <h3 className="text-body-s font-medium text-text-primary mb-xs">
          Balance
        </h3>
        <p className="text-body-xs text-text-muted mb-xs">
          Are the acidity, tannin, sweetness, and alcohol in harmony?
        </p>
        <div className="flex gap-xs">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              className="flex-1 flex items-center justify-center"
              onClick={() => setBalance(v)}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-all',
                  v <= balance
                    ? 'text-primary fill-primary'
                    : 'text-border',
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div className="mb-m">
        <h3 className="text-body-s font-medium text-text-primary mb-xs">
          Complexity
        </h3>
        <p className="text-body-xs text-text-muted mb-xs">
          How many different flavors and aromas can you detect? Does it evolve as you taste?
        </p>
        <div className="flex gap-xs">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              className="flex-1 flex items-center justify-center"
              onClick={() => setComplexity(v)}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-all',
                  v <= complexity
                    ? 'text-accent fill-accent'
                    : 'text-border',
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Finish length */}
      <div className="mb-m">
        <h3 className="text-body-s font-medium text-text-primary mb-xs">
          Finish Length
        </h3>
        <p className="text-body-xs text-text-muted mb-xs">
          How long do the flavors linger after you swallow?
        </p>
        <div className="flex flex-col gap-xs">
          {FINISH_LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={cn(
                'p-s rounded-xl border-2 transition-colors text-left',
                finishLength === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface-elevated hover:border-primary/30',
              )}
              onClick={() => setFinishLength(opt.value)}
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
      </div>

      {/* Would drink again */}
      <div className="mb-m">
        <h3 className="text-body-s font-medium text-text-primary mb-xs">
          Would you drink this again?
        </h3>
        <div className="flex gap-s">
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-xs p-s rounded-xl border-2 transition-colors',
              wouldDrinkAgain === true
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface-elevated hover:border-primary/30',
            )}
            onClick={() => setWouldDrinkAgain(true)}
          >
            <ThumbsUp className={cn('w-5 h-5', wouldDrinkAgain === true ? 'text-primary' : 'text-text-muted')} />
            <span className="text-body-s font-medium">Yes</span>
          </button>
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-xs p-s rounded-xl border-2 transition-colors',
              wouldDrinkAgain === false
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface-elevated hover:border-primary/30',
            )}
            onClick={() => setWouldDrinkAgain(false)}
          >
            <ThumbsDown className={cn('w-5 h-5', wouldDrinkAgain === false ? 'text-primary' : 'text-text-muted')} />
            <span className="text-body-s font-medium">No</span>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-m">
        <h3 className="text-body-s font-medium text-text-primary mb-xs">
          Personal Notes
        </h3>
        <textarea
          className={cn(
            'w-full p-s rounded-xl border border-border bg-surface-elevated',
            'text-body-s text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            'resize-none',
          )}
          placeholder="What stood out? Any food pairing ideas? Would you buy a bottle?"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-s mt-l">
        <Button className="flex-1" variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button className="flex-1" onClick={handleComplete}>
          Complete Tasting
        </Button>
      </div>
    </div>
  );
}
