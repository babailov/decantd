'use client';

import { Badge } from '@/common/components/Badge';
import { OCCASIONS } from '@/common/constants/wine.const';
import { TastingPlan } from '@/common/types/tasting';
import { WineType } from '@/common/types/wine';

interface OgPreviewProps {
  plan: TastingPlan;
}

export function OgPreview({ plan }: OgPreviewProps) {
  const occasionLabel =
    OCCASIONS.find((o) => o.value === plan.occasion)?.label || plan.occasion;
  const occasionEmoji =
    OCCASIONS.find((o) => o.value === plan.occasion)?.emoji || '';

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface">
      {/* Mini OG preview card */}
      <div className="bg-gradient-to-br from-background to-surface-elevated p-s">
        <div className="flex items-start justify-between mb-2">
          <p className="font-display text-body-s font-semibold text-primary line-clamp-1">
            {plan.title}
          </p>
          <span className="text-body-xs text-text-muted shrink-0 ml-2">
            {plan.wineCount} {plan.wineCount === 1 ? 'wine' : 'wines'}
          </span>
        </div>
        <p className="text-body-xs text-text-secondary mb-2">
          {occasionEmoji} {occasionLabel}
          {plan.foodPairing ? ` · ${plan.foodPairing}` : ''}
        </p>
        <div className="flex flex-wrap gap-1">
          {plan.wines.slice(0, 4).map((wine) => (
            <Badge key={wine.id} variant={wine.wineType as WineType}>
              {wine.varietal}
            </Badge>
          ))}
          {plan.wines.length > 4 && (
            <Badge>+{plan.wines.length - 4} more</Badge>
          )}
        </div>
      </div>
      <div className="px-s py-1.5 border-t border-border bg-surface-elevated">
        <p className="text-body-xs text-text-muted">decantd.app</p>
      </div>
    </div>
  );
}
