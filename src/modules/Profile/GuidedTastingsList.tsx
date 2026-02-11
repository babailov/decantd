'use client';

import { format } from 'date-fns';
import { ChevronRight, GlassWater } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { cn } from '@/common/functions/cn';
import { useGuidedTastingsList } from '@/common/hooks/services/useGuidedTastings';

const WINE_TYPE_LABELS: Record<string, string> = {
  red: 'Red',
  white: 'White',
  rose: 'Rosé',
  sparkling: 'Sparkling',
};

export function GuidedTastingsList() {
  const { data, isLoading, error } = useGuidedTastingsList();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-s">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-surface animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="text-center py-l">
        <p className="text-body-m text-text-muted">
          Unable to load your tasting notes.
        </p>
      </Card>
    );
  }

  if (data.tastings.length === 0) {
    return (
      <Card className="text-center py-l">
        <GlassWater className="h-8 w-8 text-text-muted mx-auto mb-xs" />
        <p className="text-body-m text-text-secondary">No tasting notes yet</p>
        <p className="text-body-s text-text-muted mt-1">
          Complete a guided tasting to see your notes here.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-s">
      {data.tastings.map((tasting) => (
        <Link
          key={tasting.id}
          href={`/explore/tasting-guide?id=${tasting.id}`}
        >
          <Card
            className={cn(
              'flex items-center gap-s p-s hover:bg-surface transition-colors cursor-pointer',
            )}
            variant="outlined"
          >
            <div className="flex-1 min-w-0">
              <p className="font-display text-body-l text-primary font-medium truncate">
                {tasting.wineName || 'Unnamed Wine'}
              </p>
              <div className="flex items-center gap-xs mt-1">
                <Badge variant="default">
                  {WINE_TYPE_LABELS[tasting.wineType] ?? tasting.wineType}
                </Badge>
                {tasting.varietal && (
                  <span className="text-body-xs text-text-muted truncate">
                    {tasting.varietal}
                  </span>
                )}
                {tasting.year && (
                  <span className="text-body-xs text-text-muted">
                    {tasting.year}
                  </span>
                )}
              </div>
              <p className="text-body-xs text-text-muted mt-1">
                {format(new Date(tasting.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
          </Card>
        </Link>
      ))}
    </div>
  );
}
