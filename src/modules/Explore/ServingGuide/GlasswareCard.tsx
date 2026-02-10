'use client';

import { Wine } from 'lucide-react';
import { motion } from 'motion/react';

import type { GlasswareRecommendation } from '@/common/types/explore';

interface GlasswareCardProps {
  glass: GlasswareRecommendation;
  index: number;
}

export function GlasswareCard({ glass, index }: GlasswareCardProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="p-m rounded-xl border border-border bg-surface-elevated"
      initial={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <div className="flex gap-s">
        <div className="flex-shrink-0 flex items-start justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Wine className="w-5 h-5 text-primary mt-2.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-body-s font-medium text-text-primary mb-0.5">
            {glass.name}
          </h3>
          <p className="text-body-xs text-text-secondary mb-xs">
            {glass.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-xs">
            {glass.bestFor.map((wine) => (
              <span
                key={wine}
                className="text-body-xs px-xs py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {wine}
              </span>
            ))}
          </div>
          <p className="text-body-xs text-text-muted italic">
            {glass.whyItMatters}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
