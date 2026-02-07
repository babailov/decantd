'use client';

import { Wine } from 'lucide-react';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { FlavorRadar } from '@/common/components/FlavorRadar';
import { cn } from '@/common/functions/cn';

interface WineCardProps {
  varietal: string;
  region: string;
  subRegion?: string;
  yearRange?: string;
  wineType: 'red' | 'white' | 'rose' | 'sparkling';
  description: string;
  pairingRationale: string;
  flavorNotes: string[];
  flavorProfile: {
    acidity: number;
    tannin: number;
    sweetness: number;
    alcohol: number;
    body: number;
  };
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  tastingOrder: number;
  className?: string;
}

const borderColors: Record<string, string> = {
  red: 'border-l-wine-burgundy',
  white: 'border-l-wine-goldenrod',
  rose: 'border-l-pink-400',
  sparkling: 'border-l-amber-400',
};

const badgeVariants: Record<string, 'red' | 'white' | 'rose' | 'sparkling'> = {
  red: 'red',
  white: 'white',
  rose: 'rose',
  sparkling: 'sparkling',
};

export function WineCard({
  varietal,
  region,
  subRegion,
  yearRange,
  wineType,
  description,
  pairingRationale,
  flavorNotes,
  flavorProfile,
  estimatedPriceMin,
  estimatedPriceMax,
  tastingOrder,
  className,
}: WineCardProps) {
  return (
    <Card
      className={cn(
        'border-l-4',
        borderColors[wineType],
        className,
      )}
      variant="elevated"
    >
      <div className="flex items-start justify-between mb-xs">
        <div className="flex items-center gap-xs">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-text-on-primary text-body-xs font-bold">
            {tastingOrder}
          </div>
          <div>
            <h3 className="font-display text-heading-xs text-primary">
              {varietal}
            </h3>
            <p className="text-body-xs text-text-secondary">
              {region}
              {subRegion ? `, ${subRegion}` : ''}
              {yearRange ? ` · ${yearRange}` : ''}
            </p>
          </div>
        </div>
        <Badge variant={badgeVariants[wineType]}>
          {wineType.charAt(0).toUpperCase() + wineType.slice(1)}
        </Badge>
      </div>

      <p className="text-body-s text-text-secondary mb-s">{description}</p>

      <FlavorRadar data={flavorProfile} wineType={wineType} />

      <div className="flex flex-wrap gap-1.5 mt-xs mb-s">
        {flavorNotes.map((note) => (
          <span
            key={note}
            className="text-body-xs bg-surface px-2 py-0.5 rounded-full text-text-secondary"
          >
            {note}
          </span>
        ))}
      </div>

      <div className="border-t border-border pt-xs">
        <div className="flex items-start gap-xs mb-xs">
          <Wine className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-body-xs text-text-secondary italic">
            {pairingRationale}
          </p>
        </div>
        <p className="text-body-s font-medium text-accent">
          ${estimatedPriceMin}–${estimatedPriceMax}
        </p>
      </div>
    </Card>
  );
}
