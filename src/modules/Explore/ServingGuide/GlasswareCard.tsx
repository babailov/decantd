'use client';

import { Wine } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

import type { GlasswareRecommendation } from '@/common/types/explore';

interface GlasswareCardProps {
  glass: GlasswareRecommendation;
  index: number;
}

export function GlasswareCard({ glass, index }: GlasswareCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = glass.image && !imgError;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="p-m rounded-xl border border-border bg-surface-elevated"
      initial={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <div className="flex gap-s">
        <div className="flex-shrink-0">
          {showImage ? (
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-wine-cream">
              <Image
                alt={glass.name}
                className="object-cover"
                height={80}
                src={glass.image!}
                width={64}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="flex items-start justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Wine className="w-5 h-5 text-primary mt-2.5" />
            </div>
          )}
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
