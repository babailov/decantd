'use client';

import { motion } from 'motion/react';

import { WineCard } from '@/common/components/WineCard';
import { WineRecommendation as WineRecommendationType } from '@/common/types/wine';

interface WineRecommendationProps {
  wine: WineRecommendationType;
  index: number;
}

export function WineRecommendation({
  wine,
  index,
}: WineRecommendationProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <WineCard
        className="mb-0"
        description={wine.description}
        estimatedPriceMax={wine.estimatedPriceMax}
        estimatedPriceMin={wine.estimatedPriceMin}
        flavorNotes={wine.flavorNotes}
        flavorProfile={wine.flavorProfile}
        pairingRationale={wine.pairingRationale}
        region={wine.region}
        subRegion={wine.subRegion}
        tastingOrder={wine.tastingOrder}
        varietal={wine.varietal}
        wineType={wine.wineType}
        yearRange={wine.yearRange}
      />
    </motion.div>
  );
}
