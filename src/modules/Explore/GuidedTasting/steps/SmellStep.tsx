'use client';

import { ArrowLeft, ChevronDown, X } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/common/components/Button';
import { COMMON_AROMAS, findAromaById } from '@/common/constants/aroma-wheel.const';
import { cn } from '@/common/functions/cn';
import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';

const SECTIONS = [
  { key: 'primary', label: 'Primary Aromas', description: 'From the grape itself — fruit, floral, herbal' },
  { key: 'secondary', label: 'Secondary Aromas', description: 'From winemaking — fermentation, oak, lees' },
  { key: 'tertiary', label: 'Tertiary Aromas', description: 'From aging — earth, spice, dried fruit' },
] as const;

export function SmellStep() {
  const selectedAromas = useGuidedTastingStore((s) => s.selectedAromas);
  const toggleAroma = useGuidedTastingStore((s) => s.toggleAroma);
  const nextStep = useGuidedTastingStore((s) => s.nextStep);
  const prevStep = useGuidedTastingStore((s) => s.prevStep);
  const isReviewMode = useGuidedTastingStore((s) => s.isReviewMode);
  const setCurrentStep = useGuidedTastingStore((s) => s.setCurrentStep);

  const [expandedSections, setExpandedSections] = useState<string[]>(['primary']);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Smell Your Wine
      </h2>
      <p className="text-body-m text-text-secondary mb-s">
        Swirl the glass gently. Take a few short sniffs. What do you notice?
      </p>

      {/* Selected aromas */}
      {selectedAromas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-m p-s rounded-xl bg-primary/5 border border-primary/20">
          {selectedAromas.map((id) => {
            const aroma = findAromaById(id);
            return (
              <button
                key={id}
                className="flex items-center gap-1 text-body-xs px-xs py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                onClick={() => toggleAroma(id)}
              >
                {aroma?.label ?? id}
                <X className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      )}

      {/* Aroma sections */}
      <div className="flex flex-col gap-xs">
        {SECTIONS.map(({ key, label, description }) => {
          const isExpanded = expandedSections.includes(key);
          const aromaIds = COMMON_AROMAS[key];

          return (
            <div
              key={key}
              className="rounded-xl border border-border bg-surface-elevated overflow-hidden"
            >
              <button
                className="flex items-center justify-between w-full p-s text-left"
                onClick={() => toggleSection(key)}
              >
                <div>
                  <span className="text-body-s font-medium text-text-primary block">
                    {label}
                  </span>
                  <span className="text-body-xs text-text-muted">
                    {description}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-text-muted transition-transform flex-shrink-0',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {isExpanded && (
                <motion.div
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-s pb-s"
                  initial={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {aromaIds.map((id, i) => {
                      const aroma = findAromaById(id);
                      const isSelected = selectedAromas.includes(id);

                      return (
                        <motion.button
                          key={id}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            'text-body-xs px-s py-1.5 rounded-full border transition-colors',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-surface text-text-secondary hover:border-primary/30',
                          )}
                          initial={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.15, delay: i * 0.02 }}
                          onClick={() => toggleAroma(id)}
                        >
                          {aroma?.label ?? id}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <Link
        className="block text-body-xs text-primary font-medium mt-s hover:underline text-center"
        href="/explore/aroma-wheel"
      >
        Explore the full Aroma Wheel →
      </Link>

      <div className="flex gap-s mt-l">
        {isReviewMode ? (
          <Button className="flex-1" onClick={() => setCurrentStep('summary')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Summary
          </Button>
        ) : (
          <>
            <Button className="flex-1" variant="ghost" onClick={prevStep}>
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep}>
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
